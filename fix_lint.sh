sed -i 's/Input }/}/' src/app/pos/cash-register/cash-register-client.tsx
sed -i 's/shift: any, cutoff: any/shift: Record<string, unknown>, cutoff: Record<string, unknown>/' src/app/pos/cash-register/cash-register-client.tsx
sed -i 's/setIsOpen//' src/app/pos/cash-register/cash-register-client.tsx
sed -i 's/inventory?: any\[\]/inventory?: Record<string, unknown>\[\]/' src/app/pos/inventory/inventory-client.tsx
sed -i 's/orders?: any\[\]/orders?: Record<string, unknown>\[\]/' src/app/pos/kds/kds-client.tsx
sed -i 's/item: any/item: Record<string, unknown>/' src/app/pos/kds/kds-client.tsx
sed -i 's/products?: any\[\]/products?: Record<string, unknown>\[\]/' src/app/pos/menu/menu-client.tsx
sed -i 's/Pizza, //' src/app/pos/pos-client.tsx
sed -i 's/CheckCircle2, //' src/app/pos/pos-client.tsx
sed -i '/const removeFromCart/d' src/app/pos/pos-client.tsx
sed -i 's/catch (e: any)/catch (e: unknown)/' src/app/pos/pos-client.tsx
