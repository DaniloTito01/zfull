import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Chart = ({ data, type = 'line', title, dataKey, color = '#3B82F6' }) => {
  const ChartComponent = type === 'bar' ? BarChart : LineChart;
  const DataComponent = type === 'bar' ? Bar : Line;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            {type === 'bar' ? (
              <Bar dataKey={dataKey} fill={color} />
            ) : (
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color }}
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Chart;