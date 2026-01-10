"use client";

import { useState, useEffect, useRef } from "react";
import { VisionItem, VisionCategory, VISION_CATEGORIES } from "@/lib/types";
import { getVisionItems, saveVisionItem, deleteVisionItem } from "@/lib/storage";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Image as ImageIcon,
  Link as LinkIcon,
  Upload,
  X,
  Trash2,
  Sparkles,
} from "lucide-react";

type AddMode = "url" | "upload" | null;

export default function VisionPage() {
  const [items, setItems] = useState<VisionItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<VisionCategory>("physique");
  const [addMode, setAddMode] = useState<AddMode>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    setItems(getVisionItems());
  };

  useEffect(() => {
    loadData();
    setMounted(true);
  }, []);

  const categoryItems = items.filter((item) => item.category === activeCategory);

  const handleAddByUrl = () => {
    if (imageUrl.trim()) {
      saveVisionItem({
        category: activeCategory,
        imageUrl: imageUrl.trim(),
        caption: caption.trim() || undefined,
      });
      setImageUrl("");
      setCaption("");
      setAddMode(null);
      loadData();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        saveVisionItem({
          category: activeCategory,
          imageData: base64,
          caption: caption.trim() || undefined,
        });
        setCaption("");
        setAddMode(null);
        loadData();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Remove this image from your vision board?")) {
      deleteVisionItem(id);
      loadData();
      setSelectedImage(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen pb-24">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className={`mb-6 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Vision Board</h2>
          </div>
          <p className="text-muted-foreground">Visualize your goals and inspiration</p>
        </div>

        {/* Category Tabs */}
        <div className={`flex gap-2 mb-6 overflow-x-auto pb-2 ${mounted ? "animate-fade-in animate-fade-in-delay-1" : "opacity-0"}`}>
          {VISION_CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category === cat.value).length;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {cat.label}
                {count > 0 && (
                  <span className={`ml-2 ${activeCategory === cat.value ? "opacity-80" : "opacity-60"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Add Image Section */}
        {addMode === null ? (
          <Card className={`mb-6 ${mounted ? "animate-fade-in animate-fade-in-delay-2" : "opacity-0"}`}>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setAddMode("url")}
                  className="h-20 flex flex-col gap-2"
                >
                  <LinkIcon className="w-5 h-5" />
                  <span>Paste URL</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setAddMode("upload")}
                  className="h-20 flex flex-col gap-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload Image</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {addMode === "url" ? "Add Image by URL" : "Upload Image"}
                </CardTitle>
                <Button variant="ghost" size="icon-sm" onClick={() => setAddMode(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {addMode === "url" ? (
                <>
                  <div>
                    <Label>Image URL</Label>
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Right-click any image → Copy image address
                    </p>
                  </div>
                  <div>
                    <Label>Caption (optional)</Label>
                    <Input
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="My goal physique..."
                    />
                  </div>
                  <Button onClick={handleAddByUrl} disabled={!imageUrl.trim()} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Board
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <Label>Caption (optional)</Label>
                    <Input
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="My goal physique..."
                      className="mb-4"
                    />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full h-24 border-dashed"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6" />
                      <span>Click to select image</span>
                    </div>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Image Grid */}
        <div className={mounted ? "animate-fade-in animate-fade-in-delay-3" : "opacity-0"}>
          {categoryItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categoryItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedImage(item.id)}
                  className="relative aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer group hover:ring-2 hover:ring-primary/50 transition-all"
                >
                  <img
                    src={item.imageUrl || item.imageData}
                    alt={item.caption || "Vision board image"}
                    className="w-full h-full object-cover"
                  />
                  {item.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <p className="text-white text-xs line-clamp-2">{item.caption}</p>
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity hover:bg-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="py-12">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-1">No {activeCategory} images yet</p>
                  <p className="text-sm text-muted-foreground/70">
                    Add images to visualize your {activeCategory} goals
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Full Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          {(() => {
            const item = items.find((i) => i.id === selectedImage);
            if (!item) return null;
            return (
              <div className="max-w-4xl max-h-[90vh] flex flex-col">
                <img
                  src={item.imageUrl || item.imageData}
                  alt={item.caption || "Vision board image"}
                  className="max-h-[80vh] object-contain rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
                {item.caption && (
                  <p className="text-white text-center mt-4 text-lg">{item.caption}</p>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="mx-auto mt-4"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
