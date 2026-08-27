
// src/components/Main01.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";
import { StarIcon, MapPinIcon } from "lucide-react";
import FilterSection from "./FilterSection";

const Main01 = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [ratings, setRatings] = useState({});
  const [hoveredRatings, setHoveredRatings] = useState({});
  const [filters, setFilters] = useState({
    price: [0, 50000],
    rating: 0,
    amenities: [],
  });

  const handleFilterChange = ({ type, value }) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  // Handle star rating click
  const handleStarClick = async (propertyId, rating) => {
    try {
      const response = await axios.post(
        `https://rentalwebsite.onrender.com/property/${propertyId}/rate`,
        {
          rating: rating,
          comment: "User rating",
        }
      );

      if (response.data.success) {
        setRatings((prev) => ({
          ...prev,
          [propertyId]: rating,
        }));

        setProperties((prevProperties) =>
          prevProperties.map((property) =>
            property._id === propertyId
              ? {
                  ...property,
                  reviews: [
                    ...(property.reviews || []),
                    { rating, comment: "User rating", createdAt: new Date() },
                  ],
                }
              : property
          )
        );
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  // Apply filters to properties
  useEffect(() => {
    if (properties.length) {
      let filtered = properties.filter((property) => {
        // Price filter
        const price = property.price;
        if (price < filters.price[0] || price > filters.price[1]) return false;

        // Rating filter
        const avgRating = property.reviews?.length
          ? property.reviews.reduce((sum, review) => sum + review.rating, 0) /
            property.reviews.length
          : 0;
        if (filters.rating > 0 && avgRating < filters.rating) return false;

        // Amenities filter
        if (filters.amenities.length > 0) {
          const propertyAmenities = property.amenities || [];
          if (
            !filters.amenities.every((amenity) =>
              propertyAmenities.includes(amenity)
            )
          ) {
            return false;
          }
        }

        return true;
      });

      setFilteredProperties(filtered);
    }
  }, [filters, properties]);

  // Fetch initial properties
  useEffect(() => {
    const fetchProperties = async () => {
      const searchParams = new URLSearchParams(location.search);
      const locationQuery = searchParams.get("location");
      const typeQuery = searchParams.get("type");

      try {
        setLoading(true);
        const response = await axios.get("https://rentalwebsite.onrender.com/property", {
          params: {
            location: locationQuery,
            type: typeQuery,
          },
        });

        const fetchedProperties = typeQuery
          ? response.data.filter(
              (property) =>
                property.type.toLowerCase() === typeQuery.toLowerCase()
            )
          : response.data;

        setProperties(fetchedProperties);
        setFilteredProperties(fetchedProperties);
      } catch (err) {
        console.error("Error fetching properties:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [location.search]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 bg-gray-100 p-4">
      {/* Filter Section */}
      <div className="hidden md:block">
        <FilterSection onFilterChange={handleFilterChange} />
      </div>

      {/* Properties Grid */}
      <div className="flex-1">
        {error && (
          <div className="text-red-500 mb-4 p-4 bg-red-50 rounded">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <div
                key={property._id}
                className="border bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
              >
                <Link to={`/property/${property._id}`} className="block">
                  <div className="relative">
                    <img
                      src={`https://rentalwebsite.onrender.com/images/${property._id}/0`}
                      alt={property.name || "Property Image"}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.jpg";
                      }}
                    />
                    {property.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-sm px-2 py-1 rounded">
                        {property.discount}% OFF
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h2 className="text-lg font-bold text-gray-800">
                      {property.name}
                    </h2>

                    <div className="flex items-center mt-2">
                      <MapPinIcon className="w-4 h-4 text-gray-400" />
                      <span className="ml-1 text-gray-600 text-sm">
                        {property.location}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-semibold text-purple-600">
                        {property.price}/month
                      </span>
                    </div>

                    {/* Property type and amenities preview */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-sm bg-purple-100 text-purple-600 px-2 py-1 rounded">
                        {property.type}
                      </span>
                      {property.amenities?.slice(0, 2).map((amenity) => (
                        <span
                          key={amenity}
                          className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                      {property.amenities?.length > 2 && (
                        <span className="text-sm text-gray-500">
                          +{property.amenities.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Rating section */}
                <div className="px-4 pb-3">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={(e) => {
                          e.preventDefault();
                          handleStarClick(property._id, star);
                        }}
                        onMouseEnter={() =>
                          setHoveredRatings((prev) => ({
                            ...prev,
                            [property._id]: star,
                          }))
                        }
                        onMouseLeave={() =>
                          setHoveredRatings((prev) => ({
                            ...prev,
                            [property._id]: 0,
                          }))
                        }
                        className="focus:outline-none"
                      >
                        <StarIcon
                          className={`w-5 h-5 cursor-pointer transition-colors ${
                            star <=
                            (hoveredRatings[property._id] ||
                              ratings[property._id] ||
                              property.averageRating ||
                              0)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-700">
                      ({property.reviews?.length || 0} reviews)
                    </span>
                  </div>
                </div>

                {/* View Details button */}
                <div className="p-4 pt-0">
                  <Link to={`/property/${property._id}`}>
                    <button className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-8">
              No properties found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Main01;
