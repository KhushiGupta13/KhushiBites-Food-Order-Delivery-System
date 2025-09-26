import { Card } from './Card';

function MenuGrid({ items }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map(item => <Card key={item.id} {...item} />)}
    </div>
  );
}

export default MenuGrid;
