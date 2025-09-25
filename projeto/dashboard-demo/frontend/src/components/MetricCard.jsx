const MetricCard = ({ title, value, change, period, icon }) => {
  const isPositive = change > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isPositive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {isPositive ? '+' : ''}{change}%
        </span>
        <span className="ml-2 text-sm text-gray-500">{period}</span>
      </div>
    </div>
  );
};

export default MetricCard;