import torch
import os
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from onnxruntime.quantization import quantize_dynamic, QuantType

SRC = "/Users/ashwanikushwaha/extension/apps/careerhub_production_model"
OUT = "/Users/ashwanikushwaha/extension/packages/ai-model/model/careerhub_production_model"

print("[Export] Creating output directories...")
os.makedirs(f"{OUT}/onnx", exist_ok=True)

print(f"[Export] Loading model from {SRC}...")
model = AutoModelForSequenceClassification.from_pretrained(SRC).eval()
tok = AutoTokenizer.from_pretrained(SRC)

# Prepare dummy input for trace
print("[Export] Tokenizing dummy input...")
enc = tok("example", return_tensors="pt", padding="max_length", max_length=128, truncation=True)

print("[Export] Exporting to ONNX...")
# MiniLM uses input_ids, attention_mask, and token_type_ids
torch.onnx.export(
    model,
    (enc["input_ids"], enc["attention_mask"], enc["token_type_ids"]),
    f"{OUT}/onnx/model.onnx",
    input_names=["input_ids", "attention_mask", "token_type_ids"],
    output_names=["logits"],
    dynamic_axes={
        "input_ids": {0: "batch", 1: "seq"},
        "attention_mask": {0: "batch", 1: "seq"},
        "token_type_ids": {0: "batch", 1: "seq"},
        "logits": {0: "batch", 1: "classes"}
    },
    opset_version=14,
    dynamo=False,
    do_constant_folding=True,
)

print("[Export] Quantizing ONNX model to INT8...")
quantize_dynamic(
    f"{OUT}/onnx/model.onnx",
    f"{OUT}/onnx/model_quantized.onnx",
    weight_type=QuantType.QUInt8,
    per_channel=False,
    reduce_range=False
)

# Clean up raw unquantized model to save space
print("[Export] Cleaning up unquantized model...")
if os.path.exists(f"{OUT}/onnx/model.onnx"):
    os.remove(f"{OUT}/onnx/model.onnx")

print("[Export] Copying tokenizer config and vocab files...")
import shutil
for f in ["config.json", "tokenizer.json", "tokenizer_config.json"]:
    src_file = os.path.join(SRC, f)
    dst_file = os.path.join(OUT, f)
    if os.path.exists(src_file):
         shutil.copy(src_file, dst_file)

print("[Export] ONNX export complete!")
