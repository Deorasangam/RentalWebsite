import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import {
  MapPin,
  BedDouble,
  Bath,
  Home,
  Star,
  Calendar,
  Heart,
  Share2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Tv,
  Wind,
  Coffee,
  Car,
  Dumbbell,
  Shield,
  Trees,
  User,
  Mail,
  Phone,
  X,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

// Image Gallery Component
const ImageGallery = ({ propertyId, images = [], onShowFullGallery }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const slideRef = useRef(null);

  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Desktop Gallery Grid
  const DesktopGallery = () => (
    <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[500px]">
      <div
        className="col-span-2 row-span-2 relative rounded-lg overflow-hidden cursor-pointer"
        onClick={() => onShowFullGallery(0)}
      >
        <img
          src={`https://rentalwebsite.onrender.com/images/${propertyId}/0`}
          alt="Main property view"
          className="w-full h-full object-cover"
        />
      </div>
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="relative rounded-lg overflow-hidden cursor-pointer"
          onClick={() => onShowFullGallery(index)}
        >
          <img
            src={`https://rentalwebsite.onrender.com/images/${propertyId}/${index}`}
            alt={`Property view ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );

  // Mobile Slider
  const MobileSlider = () => (
    <div className="relative md:hidden">
      <div
        ref={slideRef}
        className="relative h-72 bg-gray-200 rounded-lg overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="absolute inset-0 flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {Array.from({ length: Math.min(images.length, 5) }).map(
            (_, index) => (
              <div key={index} className="w-full h-full flex-shrink-0">
                <img
                  src={`https://rentalwebsite.onrender.com/images/${propertyId}/${index}`}
                  alt={`Property view ${index + 1}`}
                  className="w-full h-full object-cover"
                  onClick={() => onShowFullGallery(index)}
                />
              </div>
            )
          )}
        </div>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
        )}
        {currentIndex < images.length - 1 && (
          <button
            onClick={() => setCurrentIndex((prev) => prev + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {Math.min(images.length, 5)}
        </div>

        {/* Dot Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {Array.from({ length: Math.min(images.length, 5) }).map(
            (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${currentIndex === index ? "bg-white w-4" : "bg-white/50"
                  }`}
              />
            )
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      <MobileSlider />
      <DesktopGallery />
    </div>
  );
};

// PropTypes validation
ImageGallery.propTypes = {
  propertyId: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.string),
  onShowFullGallery: PropTypes.func.isRequired,
};

// Default props
ImageGallery.defaultProps = {
  images: [],
};
// Main PropertyDetails Component
const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(true);
  const [showFullGallery, setShowFullGallery] = useState(false);

  const { user } = useAuth();
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    message: "",
  });

  // Amenities configuration with icons and groups
  const amenityGroups = {
    "Basic Amenities": ["WiFi", "TV", "Air Conditioning"],
    "Outdoor & Parking": ["Parking", "Garden"],
    "Additional Features": ["Security", "Gym", "Washing Machine", "Kitchen"],
  };

  const amenityIcons = {
    WiFi: <Wifi className="w-5 h-5 text-purple-600" />,
    TV: <Tv className="w-5 h-5 text-purple-600" />,
    "Air Conditioning": <Wind className="w-5 h-5 text-purple-600" />,
    Parking: <Car className="w-5 h-5 text-purple-600" />,
    Garden: <Trees className="w-5 h-5 text-purple-600" />,
    Security: <Shield className="w-5 h-5 text-purple-600" />,
    Gym: <Dumbbell className="w-5 h-5 text-purple-600" />,
    Kitchen: <Coffee className="w-5 h-5 text-purple-600" />,
  };

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const propertyRes = await axios.get(
          `https://rentalwebsite.onrender.com/property/${id}`
        );
        setProperty(propertyRes.data.property);

        if (user) {
          try {
            const token = localStorage.getItem("token");
            const favoriteRes = await axios.get(
              `https://rentalwebsite.onrender.com/property/${id}/favorite`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            setIsFavorited(favoriteRes.data.isFavorited);
          } catch (favoriteError) {
            console.error("Error fetching favorite status:", favoriteError);
          }
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        toast.error(
          error.response?.data?.message || "Failed to load property details"
        );
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id, user, navigate]);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.warning("Please login to save favorites");
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `https://rentalwebsite.onrender.com/property/${id}/favorite`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsFavorited(response.data.isFavorited);
      toast.success(
        response.data.isFavorited
          ? "Added to favorites"
          : "Removed from favorites"
      );
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("Failed to update favorites");
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning("Please login to book");
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://rentalwebsite.onrender.com/property/${id}/book`,
        bookingData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Booking request sent successfully!");
      setBookingData({ checkIn: "", checkOut: "", message: "" });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit booking request"
      );
    }
  };

  // Property Map Component
  const PropertyMap = () => (
    <div className="h-64 md:h-96 rounded-lg overflow-hidden">
      <iframe
        title="Property Location"
        width="100%"
        height="100%"
        frameBorder="0"
        src={`https://maps.google.com/maps?q=${encodeURIComponent(
          property.location
        )}&output=embed`}
        allowFullScreen
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
        <p className="text-gray-600 mb-4">
          The property you`re looking for doesn`t exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{property.name}</h1>
          <div className="flex items-center mt-2 text-gray-600">
            <MapPin className="w-5 h-5 mr-1" />
            <span>{property.location}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleFavorite}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            <Heart
              className={`w-5 h-5 ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-500"
                }`}
            />
            <span>{isFavorited ? "Saved" : "Save"}</span>
          </button>

          <button
            onClick={async () => {
              await navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied to clipboard!");
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            <Share2 className="w-5 h-5 text-gray-500" />
            <span>Share</span>
          </button>
        </div>
      </div>
      {/* Image Gallery */}
      <ImageGallery
        propertyId={property._id}
        images={property.images}
        onShowFullGallery={(index) => {
          setSelectedImage(index);
          setShowFullGallery(true);
        }}
      />

      {/* Full Gallery Modal */}
      {showFullGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button
            onClick={() => setShowFullGallery(false)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full max-w-4xl px-4">
            <img
              src={`https://rentalwebsite.onrender.com/images/${property._id}/${selectedImage}`}
              alt={`Property view ${selectedImage + 1}`}
              className="w-full h-auto rounded-lg"
            />
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: Math.min(property.images.length, 5) }).map(
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className="w-16 h-16 rounded-lg overflow-hidden"
                  >
                    <img
                      src={`https://rentalwebsite.onrender.com/images/${property._id}/${index}`}
                      alt={`Thumbnail ${index + 1}`}
                      className={`w-full h-full object-cover ${selectedImage === index ? "ring-2 ring-purple-600" : ""
                        }`}
                    />
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Property Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-purple-600" />
                <span>{property.type}</span>
              </div>
              {property.bedrooms && (
                <div className="flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-purple-600" />
                  <span>{property.bedrooms} Bedrooms</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-purple-600" />
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">About this property</h2>
            <p className="text-gray-600 whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <button
              onClick={() => setIsAmenitiesOpen(!isAmenitiesOpen)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50"
            >
              <h2 className="text-xl font-semibold">Amenities</h2>
              {isAmenitiesOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {isAmenitiesOpen && (
              <div className="p-6 border-t">
                {Object.entries(amenityGroups).map(([group, amenities]) => (
                  <div key={group} className="mb-6 last:mb-0">
                    <h3 className="font-medium text-gray-800 mb-4">{group}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {amenities.map(
                        (amenity) =>
                          property.amenities?.includes(amenity) && (
                            <div
                              key={amenity}
                              className="flex items-center gap-2"
                            >
                              {amenityIcons[amenity]}
                              <span className="text-gray-600">{amenity}</span>
                            </div>
                          )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <PropertyMap />
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">
              Reviews ({property.reviews?.length || 0})
            </h2>
            {property.reviews && property.reviews.length > 0 ? (
              <div className="space-y-4">
                {property.reviews.map((review, index) => (
                  <div key={index} className="border-b last:border-0 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-6 h-6 text-gray-400" />
                      <span className="font-medium">
                        {review.userName || "Anonymous"}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet.</p>
            )}
          </div>
        </div>

        {/* Right Column - Booking Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold">{property.price}</span>
                <span className="text-gray-600">/month</span>
                {property.discount > 0 && (
                  <span className="text-red-500 text-sm">
                    ({property.discount}% OFF)
                  </span>
                )}
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        checkIn: e.target.value,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        checkOut: e.target.value,
                      })
                    }
                    min={bookingData.checkIn}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Message to Host
                  </label>
                  <textarea
                    value={bookingData.message}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        message: e.target.value,
                      })
                    }
                    placeholder="Tell the host about your stay..."
                    className="w-full p-2 border rounded-lg resize-none"
                    rows="3"
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 rounded-lg text-white transition-colors ${user
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-gray-400 cursor-not-allowed"
                    }`}
                  disabled={!user}
                >
                  {user ? "Book Now" : "Login to Book"}
                </button>
              </form>
            </div>

            {/* Contact Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-medium mb-4">Contact Host</h3>
              {property.email && (
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Mail className="w-5 h-5" />
                  <a
                    href={`mailto:${property.email}`}
                    className="hover:text-purple-600"
                  >
                    {property.email}
                  </a>
                </div>
              )}
              {property.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <a
                    href={`tel:${property.phone}`}
                    className="hover:text-purple-600"
                  >
                    {property.phone}
                  </a>
                </div>
              )}
            </div>

            {/* House Rules */}
            {property.rules && Object.keys(property.rules).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-medium mb-4">House Rules</h3>
                <div className="space-y-2">
                  {Object.entries(property.rules).map(([rule, allowed]) => (
                    <div key={rule} className="flex items-center gap-2">
                      {allowed ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                      <span className="capitalize">
                        {rule.replace(/([A-Z])/g, " $1").trim()}{" "}
                        {allowed ? "allowed" : "not allowed"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Property Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-medium mb-4">Property Summary</h3>
              <div className="space-y-2 text-gray-600">
                {property.type && (
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium">{property.type}</span>
                  </div>
                )}
                {property.bedrooms && (
                  <div className="flex justify-between">
                    <span>Bedrooms:</span>
                    <span className="font-medium">{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex justify-between">
                    <span>Bathrooms:</span>
                    <span className="font-medium">{property.bathrooms}</span>
                  </div>
                )}
                {property.maxGuests && (
                  <div className="flex justify-between">
                    <span>Max Guests:</span>
                    <span className="font-medium">{property.maxGuests}</span>
                  </div>
                )}
                {property.area && (
                  <div className="flex justify-between">
                    <span>Area:</span>
                    <span className="font-medium">{property.area} sq ft</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
