echo what version should be?
read VERSION

docker build -t fakkio/lireddit-api:$VERSION .
docker push fakkio/lireddit-api:$VERSION

ssh root@51.254.101.213 "docker pull fakkio/lireddit-api:$VERSION && docker tag fakkio/lireddit-api:$VERSION dokku/lireddit-api:$VERSION && dokku tags:deploy lireddit-api $VERSION"

echo
echo press any key
read a
