sed -i 's/TabsContent, //' src/app/pos/kds/kds-client.tsx
sed -i 's/orders?: any/orders?: Record<string, unknown>/' src/app/pos/kds/kds-client.tsx
sed -i 's/order: any/order: Record<string, unknown>/g' src/app/pos/kds/kds-client.tsx
sed -i 's/item: any/item: Record<string, unknown>/g' src/app/pos/kds/kds-client.tsx
sed -i 's/DialogTrigger, //' src/app/pos/menu/menu-client.tsx
sed -i '/import { revalidatePath }/d' src/app/pos/tables/actions.ts
sed -i 's/CardContent }/}/' src/app/pos/tables/tables-client.tsx
sed -i 's/initialTables: any/initialTables: Record<string, unknown>/' src/app/pos/tables/tables-client.tsx
sed -i 's/table: any/table: Record<string, unknown>/' src/app/pos/tables/tables-client.tsx
sed -i 's/setTables//' src/app/pos/tables/tables-client.tsx
sed -i 's/activeZone/activeZone_unused/' src/app/pos/tables/tables-client.tsx
