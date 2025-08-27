import React from "react";
import { useParams } from "react-router-dom";

const PropertyView: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();

  return (
    <div className="space-y-6">
      <div className="dashboard-card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Property View
        </h3>
        <p className="text-gray-600">
          Public property page for Property ID: {propertyId}
        </p>
        <p className="text-gray-600 mt-2">
          This page will contain the public review display interface that
          matches the Flex Living website style. Coming soon in the full
          implementation.
        </p>
      </div>
    </div>
  );
};

export default PropertyView;
