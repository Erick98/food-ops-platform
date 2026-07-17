sed -i 's/item.products?\.category/(item.products as Record<string, unknown>)?\.category/g' src/app/pos/kds/kds-client.tsx
sed -i 's/item.products\[0\]?\.category/(item.products as Record<string, unknown>\[\])\[0\]?\.category/g' src/app/pos/kds/kds-client.tsx
