export function Card({ title, price, image }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow duration-300">
      <img 
        src={process.env.PUBLIC_URL + image} 
        alt={title} 
        className="w-full h-40 object-cover rounded" 
      />
      <h3 className="mt-2 font-semibold text-lg">{title}</h3>
      <p className="text-gray-700">₹{price}</p>
      <button className="mt-2 bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600">
        Add to Cart
      </button>
    </div>
  );
}
