import type { Metadata } from "next";
import { Building2, Plus, Search, Filter, BedDouble, Bath, Maximize2, MapPin } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PropertyStatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DUMMY_PROPERTIES } from "@/lib/dummy-data";

export const metadata: Metadata = { title: "Properties" };

function formatPrice(price: number, listingType: string) {
  const formatted = price >= 1_000_000
    ? `AED ${(price / 1_000_000).toFixed(2)}M`
    : `AED ${(price / 1_000).toFixed(0)}K`;
  return listingType === "rent" ? `${formatted}/yr` : formatted;
}

const TYPE_COLORS: Record<string, string> = {
  apartment:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  villa:       "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  townhouse:   "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  penthouse:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  plot:        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  commercial:  "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

// Placeholder property image using gradient + icon
function PropertyImagePlaceholder({ type }: { type: string }) {
  const colors: Record<string, string> = {
    apartment:  "from-blue-400 to-blue-600",
    villa:      "from-green-400 to-green-600",
    townhouse:  "from-purple-400 to-purple-600",
    penthouse:  "from-amber-400 to-orange-600",
    plot:       "from-orange-400 to-red-500",
    commercial: "from-teal-400 to-teal-600",
  };
  return (
    <div className={`h-48 w-full bg-gradient-to-br ${colors[type] ?? "from-gray-400 to-gray-600"} flex items-center justify-center`}>
      <Building2 className="h-12 w-12 text-white/60" />
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Properties"
        description={`${DUMMY_PROPERTIES.length} properties in your portfolio`}
        icon={Building2}
      >
        <Button className="bg-amber-500 hover:bg-amber-600 text-white" size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Property
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search properties…" className="pl-9 h-9 text-sm" />
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="h-9 w-36 text-sm">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="penthouse">Penthouse</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="h-9 w-36 text-sm">
              <SelectValue placeholder="Listing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sale & Rent</SelectItem>
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: "All", count: DUMMY_PROPERTIES.length, active: true },
          { label: "Available", count: DUMMY_PROPERTIES.filter(p => p.status === "available").length, active: false },
          { label: "Under Offer", count: DUMMY_PROPERTIES.filter(p => p.status === "under-offer").length, active: false },
          { label: "For Rent", count: DUMMY_PROPERTIES.filter(p => p.listingType === "rent").length, active: false },
        ].map((tab) => (
          <button
            key={tab.label}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              tab.active
                ? "bg-amber-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
            <span className={`text-xs rounded-full px-1.5 py-0 h-5 flex items-center ${
              tab.active ? "bg-white/20 text-white" : "bg-background text-muted-foreground"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {DUMMY_PROPERTIES.map((property) => (
          <Card
            key={property.id}
            className="overflow-hidden hover:shadow-lg hover:border-amber-200 dark:hover:border-amber-900/60 transition-all duration-200 cursor-pointer group"
          >
            {/* Image */}
            <div className="overflow-hidden">
              <div className="group-hover:scale-105 transition-transform duration-300">
                <PropertyImagePlaceholder type={property.type} />
              </div>
            </div>

            {/* Badges overlay */}
            <div className="relative">
              <div className="absolute -top-10 left-3 flex gap-1.5">
                <Badge className={`text-[10px] capitalize border-0 shadow-sm ${TYPE_COLORS[property.type]}`}>
                  {property.type}
                </Badge>
                <Badge
                  className={`text-[10px] border-0 shadow-sm ${
                    property.listingType === "sale"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {property.listingType === "sale" ? "For Sale" : "For Rent"}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4 pt-6">
              {/* Title & Status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">
                  {property.title}
                </h3>
                <PropertyStatusBadge status={property.status} />
              </div>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <span className="truncate">{property.location}</span>
              </div>

              {/* Specs */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                {property.bedrooms > 0 && (
                  <div className="flex items-center gap-1">
                    <BedDouble className="h-3.5 w-3.5" />
                    <span>{property.bedrooms} Bed</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Bath className="h-3.5 w-3.5" />
                  <span>{property.bathrooms} Bath</span>
                </div>
                <div className="flex items-center gap-1">
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>{property.area.toLocaleString()} sqft</span>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {property.features.slice(0, 3).map((f) => (
                  <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {f}
                  </span>
                ))}
                {property.features.length > 3 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    +{property.features.length - 3}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <p className="text-base font-bold text-amber-600 dark:text-amber-400">
                  {formatPrice(property.price, property.listingType)}
                </p>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
