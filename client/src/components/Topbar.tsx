// client/src/components/Topbar.tsx

"use client";

import { useState, useEffect } from "react";
import { MapPin, Phone, Mail, Clock, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function Topbar() {
  const [currentTime, setCurrentTime] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const contactInfo = {
    phone: "+8801914600880", 
    email: "duemanbd@gmail.com",
    location: {
      address: "Banani, Dhaka",
      googleMapsUrl: "https://www.google.com/maps/place/NEST+Mega+Mall/@23.7914549,90.4060572,17z/data=!3m1!4b1!4m6!3m5!1s0x3755c700677612d7:0xd22b88878af62769!8m2!3d23.7914549!4d90.4060572!16s%2Fg%2F11y69bj9pd?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D",
    },
  };

  const whatsappNumber = "+8801914600880";

  // Mobile view - collapsed/expanded
  if (isMobile) {
    return (
      <div className="w-full bg-white border-b border-slate-200 shadow-sm">
        {/* Top Row - Always visible */}
        <div className="px-4 py-2 flex justify-between items-center">
          {/* Time */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">{currentTime}</span>
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-slate-600 hover:text-amber-600"
            aria-label={isExpanded ? "Collapse contact info" : "Expand contact info"}
          >
            <span className="text-sm font-medium">Contact</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {/* Live Chat - Always visible */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=Hello%20I%20need%20support`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-full shadow-sm transition text-sm font-semibold"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-3 border-t border-slate-100 pt-3 animate-fadeIn">
            <div className="space-y-2">
              {/* Phone */}
              <a
                href={`tel:${contactInfo.phone}`}
                className="flex items-center gap-2 text-slate-700 hover:text-amber-600 transition p-2 hover:bg-amber-50 rounded-lg"
              >
                <div className="w-7 h-7 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <span className="text-sm font-medium">{contactInfo.phone}</span>
              </a>

              {/* Email */}
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-2 text-slate-700 hover:text-amber-600 transition p-2 hover:bg-amber-50 rounded-lg"
              >
                <div className="w-7 h-7 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <span className="text-sm font-medium truncate">{contactInfo.email}</span>
              </a>

              {/* Location */}
              <a
                href={contactInfo.location.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-700 hover:text-amber-600 transition p-2 hover:bg-amber-50 rounded-lg"
              >
                <div className="w-7 h-7 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <span className="text-sm font-medium">{contactInfo.location.address}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop view - Original layout with improvements
  return (
    <div className="w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* LEFT — TIME */}
          <div className="flex items-center gap-2 order-1 sm:order-1">
            <div className="w-7 h-7 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">{currentTime}</span>
          </div>

          {/* CENTER — CONTACT INFO */}
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 order-3 sm:order-2 mt-2 sm:mt-0">
            {/* Location */}
            <a
              href={contactInfo.location.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-700 hover:text-amber-600 transition-colors group"
              title="View on Google Maps"
            >
              <div className="w-7 h-7 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 group-hover:bg-amber-100 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                {contactInfo.location.address}
              </span>
            </a>

            {/* Phone */}
            <a
              href={`tel:${contactInfo.phone}`}
              className="flex items-center gap-2 text-slate-700 hover:text-amber-600 transition-colors group"
              title="Call us"
            >
              <div className="w-7 h-7 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 group-hover:bg-amber-100 transition-colors">
                <Phone className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="text-sm font-medium hidden md:inline">
                {contactInfo.phone}
              </span>
              <span className="text-sm font-medium md:hidden">
                Call Us
              </span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${contactInfo.email}`}
              className="flex items-center gap-2 text-slate-700 hover:text-amber-600 transition-colors group"
              title="Send email"
            >
              <div className="w-7 h-7 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 group-hover:bg-amber-100 transition-colors">
                <Mail className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="text-sm font-medium hidden lg:inline truncate max-w-[180px]">
                {contactInfo.email}
              </span>
              <span className="text-sm font-medium lg:hidden">
                Email
              </span>
            </a>
          </div>

          {/* RIGHT — LIVE CHAT */}
          <div className="flex justify-center sm:justify-end order-2 sm:order-3">
            <a
              href={`https://wa.me/${whatsappNumber}?text=Hello%20I%20need%20support`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-sm font-semibold group"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Live Chat</span>
              <span className="sm:hidden">Chat</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}