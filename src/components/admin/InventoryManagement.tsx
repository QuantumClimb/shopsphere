import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Plus, Upload, X, Search } from "lucide-react";
import { API_BASE_URL, SERVER_BASE_URL } from "@/lib/apiConfig";
import { MenuItem } from "@/types/menu";

interface InventoryManagementProps {
  onClose?: () => void;
}

export default function InventoryManagement({ onClose }: InventoryManagementProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    namePt: "",
    brand: "",
    description: "",
    descriptionPt: "",
    price: "",
    volume: "100",
    concentration: "EDP",
    gender: "Unisex",
    fragranceFamily: "",
    topNotes: "",
    middleNotes: "",
    baseNotes: "",
    stockQuantity: "10",
    inStock: true,
    categoryId: "",
    imageUrl: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [currentPage, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });
      
      if (selectedCategory && selectedCategory !== "all") {
        params.append('category', selectedCategory);
      }

      if (searchQuery) {
        params.append('q', searchQuery);
      }
      
      const response = await fetch(`${API_BASE_URL}/admin/menu-items?${params}`);
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      
      setItems(data.items);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (err) {
      setError('Failed to load inventory');
      setLoading(false);
      console.error(err);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/upload-image`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to upload image');
      const data = await response.json();
      setUploading(false);
      return data.imageUrl;
    } catch (err) {
      setUploading(false);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      let finalImageUrl = formData.imageUrl;
      
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }

      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        volume: parseFloat(formData.volume),
        stockQuantity: parseInt(formData.stockQuantity),
        imageUrl: finalImageUrl
      };

      const url = editingItem 
        ? `${API_BASE_URL}/admin/menu-items/${editingItem.id}`
        : `${API_BASE_URL}/admin/menu-items`;
        
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) throw new Error('Failed to save item');

      fetchItems();
      resetForm();
      setIsDialogOpen(false);
    } catch (err) {
      setError('Failed to save item');
      console.error(err);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      namePt: item.namePt || "",
      brand: item.brand || "",
      description: item.description || "",
      descriptionPt: item.descriptionPt || "",
      price: item.price.toString(),
      volume: (item.volume || 100).toString(),
      concentration: item.concentration || "EDP",
      gender: item.gender || "Unisex",
      fragranceFamily: item.fragranceFamily || "",
      topNotes: item.topNotes || "",
      middleNotes: item.middleNotes || "",
      baseNotes: item.baseNotes || "",
      stockQuantity: (item.stockQuantity || 10).toString(),
      inStock: item.inStock !== false,
      categoryId: item.categoryId.toString(),
      imageUrl: item.imageUrl || ""
    });
    setImagePreview(item.imageUrl ? `${SERVER_BASE_URL}${item.imageUrl}` : "");
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fragrance?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/menu-items/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete item');
      fetchItems();
    } catch (err) {
      setError('Failed to delete item');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      namePt: "",
      brand: "",
      description: "",
      descriptionPt: "",
      price: "",
      volume: "100",
      concentration: "EDP",
      gender: "Unisex",
      fragranceFamily: "",
      topNotes: "",
      middleNotes: "",
      baseNotes: "",
      stockQuantity: "10",
      inStock: true,
      categoryId: "",
      imageUrl: ""
    });
    setEditingItem(null);
    setImageFile(null);
    setImagePreview("");
  };

  const getGenderBadgeColor = (gender: string) => {
    switch(gender?.toLowerCase()) {
      case 'male': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'female': return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
      default: return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Inventory Management</h2>
          <p className="text-foreground/70">Manage perfume products and stock levels</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Fragrance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Fragrance' : 'Add New Fragrance'}
                </DialogTitle>
                <DialogDescription>
                  Update the details, pricing, and classification of this fragrance.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Media & Classification */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Product Image</Label>
                      <div className="flex flex-col space-y-4">
                        {imagePreview ? (
                          <div className="relative aspect-square border rounded-lg overflow-hidden bg-muted/20">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="w-full h-full object-contain"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setImagePreview("");
                                setImageFile(null);
                                setFormData(prev => ({ ...prev, imageUrl: "" }));
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
                            <Upload className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">Upload image</p>
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand *</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (₹) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Store Category *</Label>
                        <Select 
                          value={formData.categoryId} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender Target *</Label>
                        <Select 
                          value={formData.gender} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Unisex">Unisex</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Details & Notes */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Fragrance Name (English) *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="volume">Volume (ml)</Label>
                        <Input
                          id="volume"
                          type="number"
                          value={formData.volume}
                          onChange={(e) => setFormData(prev => ({ ...prev, volume: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="concentration">Concentration</Label>
                        <Select 
                          value={formData.concentration} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, concentration: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EDP">Eau de Parfum (EDP)</SelectItem>
                            <SelectItem value="EDT">Eau de Toilette (EDT)</SelectItem>
                            <SelectItem value="Parfum">Parfum</SelectItem>
                            <SelectItem value="Cologne">Cologne</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fragranceFamily">Fragrance Family</Label>
                      <Input
                        id="fragranceFamily"
                        placeholder="e.g. Woody, Floral, Oriental"
                        value={formData.fragranceFamily}
                        onChange={(e) => setFormData(prev => ({ ...prev, fragranceFamily: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes (Comma separated)</Label>
                      <div className="grid grid-cols-1 gap-2">
                        <Input
                          placeholder="Top Notes"
                          value={formData.topNotes}
                          onChange={(e) => setFormData(prev => ({ ...prev, topNotes: e.target.value }))}
                        />
                        <Input
                          placeholder="Middle Notes"
                          value={formData.middleNotes}
                          onChange={(e) => setFormData(prev => ({ ...prev, middleNotes: e.target.value }))}
                        />
                        <Input
                          placeholder="Base Notes"
                          value={formData.baseNotes}
                          onChange={(e) => setFormData(prev => ({ ...prev, baseNotes: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stockQuantity}
                          onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-8">
                        <Label htmlFor="inStock">Available for Sale</Label>
                        <Switch
                          id="inStock"
                          checked={formData.inStock}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inStock: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? "Uploading..." : editingItem ? "Update Fragrance" : "Add Fragrance"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="bg-card/50 border-primary/10">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, brand or notes..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchItems()}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={fetchItems}>
            Search
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p>Loading inventory...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="group bg-card/30 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all overflow-hidden flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden bg-muted/10">
                  {item.imageUrl ? (
                    <img 
                      src={`${SERVER_BASE_URL}${item.imageUrl}`} 
                      alt={item.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Search className="w-12 h-12 opacity-10" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <Badge className={getGenderBadgeColor(item.gender || "")}>
                      {item.gender}
                    </Badge>
                  </div>
                  {!item.inStock && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                      <Badge variant="destructive" className="text-sm font-bold">OUT OF STOCK</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="mb-2">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{item.brand}</p>
                    <h3 className="font-bold text-lg leading-tight line-clamp-1">{item.name}</h3>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-primary">₹{item.price.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">{item.volume}ml | {item.concentration}</span>
                  </div>

                  <div className="space-y-2 mt-auto">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px] py-0">{item.category}</Badge>
                      {item.fragranceFamily && (
                        <Badge variant="outline" className="text-[10px] py-0 bg-primary/5">{item.fragranceFamily}</Badge>
                      )}
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2 border-t border-primary/5">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 py-8">
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </Button>
              <div className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          )}
          
          {items.length === 0 && (
            <div className="text-center py-20 bg-muted/5 rounded-xl border border-dashed">
              <p className="text-muted-foreground">No fragrances found matching your criteria.</p>
              <Button variant="link" onClick={() => {setSearchQuery(""); setSelectedCategory("all");}}>
                Clear all filters
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
