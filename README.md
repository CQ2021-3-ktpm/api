# Instructions

1. Add DB_URL in env

2. Generate prisma
```
npx prisma generate
```

3. Install package
```
yarn
```

4. Run dev
```
yarn start
```

## Migration
1. Create a New Migration
```bash
npx prisma migrate dev --name <migration_name>
```

2. Apply Migrations in Production
```bash
npx prisma migrate deploy
```
