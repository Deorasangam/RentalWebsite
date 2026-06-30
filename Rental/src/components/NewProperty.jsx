import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function NewProperty() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [discount, setDiscount] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const navigate = useNavigate();

  // Available amenities based on the Property schema
  const availableAmenities = [
    "WiFi",
    "TV",
    "Air Conditioning",
    "Heating",
    "Kitchen",
    "Washing Machine",
    "Parking",
    "Elevator",
    "Swimming Pool",
    "Gym",
    "Security",
    "Balcony",
    "Garden",
    "Furniture",
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error("Maximum 5 images allowed");
      e.target.value = null;
      return;
    }
    setImage(files);
  };

  const handleAmenityChange = (amenity) => {
    if (amenities.includes(amenity)) {
      // Remove amenity if already selected
      setAmenities(amenities.filter((item) => item !== amenity));
    } else {
      // Add amenity if not selected
      setAmenities([...amenities, amenity]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("price", price);
    formData.append("location", location);
    formData.append("discount", discount);
    formData.append("description", description);
    formData.append("email", email);

    // Append amenities as JSON string
    formData.append("amenities", JSON.stringify(amenities));

    image.forEach((image, index) => {
      formData.append("images", image);
    });

    try {
      await axios.post("http://localhost:5000/NewProperty", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Property added successfully!");
      navigate("/Main01");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add property.");
      console.error("Error adding property:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-md rounded-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Fields */}
        <label className="block text-sm font-medium text-gray-700">
          Property Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Property Name"
          className="w-full p-3 border rounded-md"
          required
        />
        <label className="block text-sm font-medium text-gray-700">
          Property Type
        </label>
        <input
          name="type"
          placeholder="House , Apartment, Room, PG, Hostel"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full p-3 border rounded-md"
          required
        />
        <label className="block text-sm font-medium text-gray-700">
          Price per month ($)
        </label>
        <input
          type="number"
          name="price"
          placeholder="Price per month"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-3 border rounded-md"
          required
        />
        <label className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          type="text"
          name="location"
          placeholder="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-3 border rounded-md"
          required
        />
        <label className="block text-sm font-medium text-gray-700">
          Discount
        </label>
        <input
          type="number"
          name="discount"
          placeholder="discount"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          className="w-full p-3 border rounded-md"
        />
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          type="text"
          name="Description"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border rounded-md"
          required
        />
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-md"
          required
        />

        {/* Amenities Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Amenities
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableAmenities.map((amenity) => (
              <div key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  id={`amenity-${amenity}`}
                  checked={amenities.includes(amenity)}
                  onChange={() => handleAmenityChange(amenity)}
                  className="mr-2"
                />
                <label htmlFor={`amenity-${amenity}`} className="text-sm">
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Property Images (Max 5)
          </label>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            multiple
            required
            className="w-full p-2 border rounded-md"
          />
          <p className="text-sm text-gray-500">
            Selected images: {image.length}/5
          </p>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
        >
          Add Property
        </button>
      </form>
    </div>
  );
}

export default NewProperty;
