echo "Starting setup..."

echo "Storage service setup"
cd server
npm install
echo "Finished!"

echo "API Gateway setup"
cd ../api-gateway
npm install
echo "Finished!"

echo "Good to go!"