import os
import shutil
import random

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_RAW = os.path.join(BASE_DIR, "dataset_raw")
DATASET_SPLIT = os.path.join(BASE_DIR, "dataset_split")

TRAIN_RATIO = 0.7
VAL_RATIO = 0.2
TEST_RATIO = 0.1

random.seed(42)

if os.path.exists(DATASET_SPLIT):
    shutil.rmtree(DATASET_SPLIT)

for etiqueta in os.listdir(DATASET_RAW):
    origen = os.path.join(DATASET_RAW, etiqueta)
    if not os.path.isdir(origen):
        continue

    imgs = os.listdir(origen)
    random.shuffle(imgs)

    total = len(imgs)
    train_end = int(total * TRAIN_RATIO)
    val_end = train_end + int(total * VAL_RATIO)

    splits = {
        "train": imgs[:train_end],
        "val": imgs[train_end:val_end],
        "test": imgs[val_end:]
    }

    for split, archivos in splits.items():
        destino = os.path.join(DATASET_SPLIT, split, etiqueta)
        os.makedirs(destino, exist_ok=True)

        for archivo in archivos:
            src = os.path.join(origen, archivo)
            dst = os.path.join(destino, archivo)
            shutil.copy(src, dst)

print("\n✅ DATASET DIVIDIDO (train / val / test)\n")