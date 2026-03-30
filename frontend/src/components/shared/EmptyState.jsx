import React from 'react';

const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="text-center py-12 px-4 border border-dashed rounded-xl bg-white">
      {icon ? <div className="mx-auto mb-3 w-fit text-gray-400">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {description ? <p className="text-gray-500 mt-2">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
};

export default EmptyState;
