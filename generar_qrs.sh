#!/bin/bash

# Verificar si se pasó una IP como argumento
if [ -z "$1" ]; then
    echo "Error: Debes proporcionar una IP o dominio."
    echo "Uso: bash generar_qrs.sh 192.168.1.50"
    exit 1
fi

IP_DESTINO=$1
CARPETA="qrs_para_imprimir"

echo "Generando QRs para la dirección: http://$IP_DESTINO:3000"

# Crear o limpiar carpeta
rm -rf "$CARPETA"
mkdir -p "$CARPETA"

# Lista de mesas y sus tokens (basado en tu base de datos)
declare -A mesas
mesas=(
    ["01"]="m1-qr-a3f8k2p9"
    ["02"]="m2-qr-b7n4x1w6"
    ["03"]="m3-qr-c2j9r5t8"
    ["04"]="m4-qr-d6v1m3q7"
    ["05"]="m5-qr-e4h8l0u2"
    ["06"]="m6-qr-f9z3k7p5"
    ["07"]="m7-qr-g1y6n4s8"
    ["08"]="m8-qr-h5w2x9r3"
    ["09"]="m9-qr-i8q4j7v1"
    ["10"]="m10-qr-j3t5b2n9"
)

# Descargar cada QR
for num in "${!mesas[@]}"; do
    token=${mesas[$num]}
    URL="http://$IP_DESTINO:3000/mesa/${num#0}?token=$token"
    echo "Descargando QR Mesa $num..."
    curl -s "https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=$(echo $URL | sed 's/:/%3A/g; s/\//%2F/g; s/?/%3F/g; s/=/%3D/g; s/&/%26/g')" -o "$CARPETA/mesa_$num.png"
done

echo "------------------------------------------"
echo "¡Hecho! Los QRs están en la carpeta: $CARPETA"
