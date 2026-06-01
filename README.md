# Chenille Chat

使用`pm2`启动API服务

```sh
pm2 start npm --name "chenille-chat-api" -- run start
```

用于清空数据库，**慎用**

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
