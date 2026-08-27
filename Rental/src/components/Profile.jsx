import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get("https://rentalwebsite.onrender.com/profile");
        setProperties(response.data.properties);
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (error.response?.status === 401) {
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate, logout]);

  if (!user) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="mb-4">
          <p className="text-gray-600">Name: {user?.name}</p>
          <p className="text-gray-600">Email: {user?.email}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">My Properties</h2>
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {properties.map((property) => (
              <div key={property._id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{property.name}</h3>
                <p className="text-gray-600">{property.location}</p>
                <p className="text-purple-600">${property.price}/month</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No properties listed yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
