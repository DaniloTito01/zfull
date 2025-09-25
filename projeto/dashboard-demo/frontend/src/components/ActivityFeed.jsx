const ActivityFeed = ({ activities }) => {
  const getIconForType = (type) => {
    const iconClass = "w-3 h-3 rounded-full";
    switch (type) {
      case 'user':
        return <div className={`${iconClass} bg-blue-500`}></div>;
      case 'payment':
        return <div className={`${iconClass} bg-green-500`}></div>;
      case 'support':
        return <div className={`${iconClass} bg-yellow-500`}></div>;
      case 'review':
        return <div className={`${iconClass} bg-purple-500`}></div>;
      case 'order':
        return <div className={`${iconClass} bg-orange-500`}></div>;
      default:
        return <div className={`${iconClass} bg-gray-500`}></div>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities?.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3">
            {getIconForType(activity.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{activity.action}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;