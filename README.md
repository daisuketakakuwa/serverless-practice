# serveless-practice

## How to test on local

### 1. npm install

```
npm install
```

### 2. run db container

```
docker compose up -d
```

### 3. create table

```
# login container
docker exec -it serverless-practice-db bash -p

# create table
cd /tmp/db
mysql --user=root --password=passw@rd < create_table.sql serverlessPracticeDb
```

### 4. run lambda on local

```
npx sls offline start
```

### 5. upload file to local s3

```
aws --endpoint http://localhost:4569 --profile s3local s3 cp ./tests/resources/sample_user.csv s3://local-bucket/sample_user.csv
```

### 6. check if data is imported

```
mysql> select * from sample_user;
+---------+-----------+------+
| user_id | user_name | age  |
+---------+-----------+------+
| 00001   | Anthony   |   10 |
| 00002   | Bryant    |   20 |
| 00003   | Carmelo   |   30 |
+---------+-----------+------+
3 rows in set (0.00 sec)
```
