import json
import numpy as np
import onnxruntime as ort
import os
from transformers import AutoTokenizer
from sklearn.metrics import f1_score
from sklearn.model_selection import train_test_split

DATASET_PATH = '/Users/ashwanikushwaha/dataCollector/dataset/exports/clean_dataset.jsonl'
MODEL_DIR = '/Users/ashwanikushwaha/extension/packages/ai-model/model/careerhub_production_model'

print("[SplitVal] Loading dataset...")
records = []
for line in open(DATASET_PATH, 'r', encoding='utf-8'):
    if line.strip():
        records.append(json.loads(line))

MODEL_CLASSES = [
  'availability.expected_salary',
  'contact.address_city',
  'contact.address_country',
  'contact.address_state',
  'contact.address_zip',
  'contact.email',
  'contact.phone_number',
  'education.college',
  'education.degree',
  'education.gpa',
  'experience.company_name',
  'experience.job_title',
  'miscellaneous',
  'personal.first_name',
  'personal.full_name',
  'personal.last_name',
  'resume.upload_field',
  'social.github',
  'social.linkedin',
  'social.portfolio',
]

y_true = []
for r in records:
    lbl = r.get('semanticLabel')
    if lbl not in MODEL_CLASSES:
        lbl = 'miscellaneous'
    y_true.append(lbl)

# Split with random state 42 (matching standard train/val setup)
_, test_idx = train_test_split(range(len(records)), test_size=0.2, random_state=42)

test_records = [records[i] for i in test_idx]
test_y_true = [y_true[i] for i in test_idx]
print(f"[SplitVal] Evaluating on {len(test_records)} split validation records.")

tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
session = ort.InferenceSession(os.path.join(MODEL_DIR, "onnx", "model_quantized.onnx"))

def build_text(r, separator, null_policy, style):
    fields = [
        ('Label', r.get('visibleLabel')),
        ('Placeholder', r.get('placeholder')),
        ('FieldName', r.get('fieldName')),
        ('Nearby', r.get('nearbyText')),
        ('Section', r.get('sectionHeading')),
        ('Aria', r.get('ariaLabel')),
        ('Type', r.get('fieldType')),
    ]
    parts = []
    for key, val in fields:
        val = str(val or '').strip()
        is_null = not val
        if is_null:
            if null_policy == 'skip':
                continue
            elif null_policy == 'none_str':
                parts.append(f"{key}: None" if style == 'prefix' else 'None')
            elif null_policy == 'empty':
                parts.append(f"{key}: " if style == 'prefix' else '')
        else:
            parts.append(f"{key}: {val}" if style == 'prefix' else val)
    return separator.join(parts)

# Search
for separator in [' | ', '\n', ' [SEP] ']:
    for null_policy in ['skip', 'none_str', 'empty']:
        for style in ['prefix', 'raw']:
            y_pred = []
            for r in test_records:
                text = build_text(r, separator, null_policy, style)
                enc = tokenizer(text, max_length=128, truncation=True, padding='max_length')
                inputs = {
                    'input_ids': np.array([enc['input_ids']], dtype=np.int64),
                    'attention_mask': np.array([enc['attention_mask']], dtype=np.int64),
                    'token_type_ids': np.array([enc['token_type_ids']], dtype=np.int64),
                }
                logits = session.run(None, inputs)[0][0]
                pred_idx = np.argmax(logits)
                y_pred.append(MODEL_CLASSES[pred_idx])
            
            macro_f1 = f1_score(test_y_true, y_pred, average='macro')
            print(f"Sep: {repr(separator)} | Null: {null_policy:<8} | Style: {style:<6} => Macro-F1: {macro_f1:.4f}")
