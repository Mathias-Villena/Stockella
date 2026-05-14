import os
from urllib.parse import urlparse
import psycopg2
import boto3
from dotenv import load_dotenv

# ============================
# CONFIG
# ============================
load_dotenv()

ETIQUETAS_VALIDAS = [
    "casino_menta",
    "inca_kola",
    "marsella",
    "nik",
]

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "dataset_raw")

os.makedirs(DATASET_DIR, exist_ok=True)

BUCKET = os.getenv("AWS_S3_BUCKET")
REGION = os.getenv("AWS_REGION")

s3 = boto3.client(
    "s3",
    region_name=REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

# ============================
# DB
# ============================
conn = psycopg2.connect(
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASS"),
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
)

cursor = conn.cursor()

cursor.execute("""
    SELECT id_dataset, etiqueta, imagen_url
    FROM dataset_ml
    WHERE etiqueta = ANY(%s)
      AND imagen_url LIKE %s
    ORDER BY etiqueta, id_dataset;
""", (ETIQUETAS_VALIDAS, "%/dataset/%"))

rows = cursor.fetchall()

print(f"\n📊 Total imágenes encontradas: {len(rows)}\n")

# ============================
# EXTRAER KEY DE URL S3
# ============================
def extraer_s3_key(url):
    parsed = urlparse(url)
    return parsed.path.lstrip("/")

# ============================
# DESCARGA DESDE S3 PRIVADO
# ============================
for id_dataset, etiqueta, url in rows:
    carpeta = os.path.join(DATASET_DIR, etiqueta)
    os.makedirs(carpeta, exist_ok=True)

    key = extraer_s3_key(url)

    extension = key.split(".")[-1].lower()
    if extension not in ["jpg", "jpeg", "png", "webp"]:
        extension = "jpg"

    nombre = f"{etiqueta}_{id_dataset}.{extension}"
    path = os.path.join(carpeta, nombre)

    if os.path.exists(path):
        print(f"✔ Ya existe: {nombre}")
        continue

    try:
        s3.download_file(BUCKET, key, path)
        print(f"⬇ Descargada: {nombre}")

    except Exception as e:
        print(f"❌ Error descargando {key}: {e}")

cursor.close()
conn.close()

print("\n✅ DATASET DESCARGADO\n")