echo "Starting setup..."

cd storage-service/
sh scripts/setup.sh

cd api-gateway/
sh scripts/setup.sh

echo "Good to go!"