import json
import numpy as np
import onnxruntime as ort
import os
from transformers import AutoTokenizer
from sklearn.metrics import f1_score

# Paths
DATASET_PATH = '/Users/ashwanikushwaha/dataCollector/dataset/exports/clean_dataset.jsonl'
MODEL_DIR = '/Users/ashwanikushwaha/extension/packages/ai-model/model/careerhub_production_model'

print("[Validate] Loading dataset...")
records = []
for line in open(DATASET_PATH, 'r', encoding='utf-8'):
    if line.strip():
        records.append(json.loads(line))
print(f"[Validate] Loaded {len(records)} records.")

# Load model & tokenizer
print("[Validate] Initialising ONNX Runtime and Tokeniser...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
session = ort.InferenceSession(os.path.join(MODEL_DIR, "onnx", "model_quantized.onnx"))

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

# Precompute target labels (map unknown classes to miscellaneous)
y_true = []
for r in records:
    lbl = r.get('semanticLabel')
    if lbl not in MODEL_CLASSES:
        lbl = 'miscellaneous'
    y_true.append(lbl)

print("[Validate] Searching for the trained preprocessor configuration...")
best_f1 = -1.0
best_config = {}

separators = [' | ', '\n', ' [SEP] ']
null_policies = ['skip', 'none_str', 'empty']
styles = ['prefix', 'raw']

for separator in separators:
    for null_policy in null_policies:
        for style in styles:
            y_pred = []
            
            # Predict batch or individual
            # For simplicity and correctness, run individual fast predictions
            for r in records:
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
            
            macro_f1 = f1_score(y_true, y_pred, average='macro')
            print(f"Sep: {repr(separator)} | Null: {null_policy:<8} | Style: {style:<6} => Macro-F1: {macro_f1:.4f}")
            
            if macro_f1 > best_f1:
                best_f1 = macro_f1
                best_config = {
                    'separator': separator,
                    'null_policy': null_policy,
                    'style': style
                }

print("\n=============================================")
print("🏆 BEST CONFIGURATION FOUND:")
print(f"  Separator:   {repr(best_config['separator'])}")
print(f"  Null Policy: {best_config['null_policy']}")
print(f"  Style:       {best_config['style']}")
print(f"  Macro-F1:    {best_f1:.4f}")
print("=============================================")

if 0.38 <= best_f1 <= 0.47:
    print(f"✅ SUCCESS: Macro-F1 score {best_f1:.4f} is within target range [0.38, 0.47].")
    import sys
    sys.exit(0)
else:
    print(f"❌ FAILURE: Macro-F1 score {best_f1:.4f} is outside target range [0.38, 0.47].")
    import sys
    sys.exit(1)
