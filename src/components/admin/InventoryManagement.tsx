import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Plus, Upload, X, Search, MoreVertical } from "lucide-react";
import { API_BASE_URL, SERVER_BASE_URL } from "@/lib/apiConfig";
import { MenuItem } from "@/types/menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
    brand: "",
    description: "",
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
  }, [currentPage, selectedCategory, searchQuery]);

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
        limit: '20'
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

  const handleToggleStock = async (item: MenuItem, currentInStock: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/menu-items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          inStock: !currentInStock
        })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      // Update local state
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, inStock: !currentInStock } : i));
    } catch (err) {
      setError('Failed to update status');
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
      brand: item.brand || "",
      description: item.description || "",
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
      brand: "",
      description: "",
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Fragrance Inventory</h2>
          <p className="text-foreground/70 text-sm">List and manage your fragrance collection</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                New Fragrance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit' : 'Add'} Fragrance</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Image</Label>
                      <div className="flex flex-col space-y-2">
                        {imagePreview && (
                          <div className="relative w-32 h-32 border rounded overflow-hidden">
                            <img src={imagePreview} className="w-full h-full object-contain" />
                            <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => {setImagePreview(""); setImageFile(null);}}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                        <Input type="file" accept="image/*" onChange={handleImageSelect} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Brand</Label><Input value={formData.brand} onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))} required /></div>
                      <div className="space-y-2"><Label>Price (₹)</Label><Input type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={formData.categoryId} onValueChange={(v) => setFormData(prev => ({ ...prev, categoryId: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select value={formData.gender} onValueChange={(v) => setFormData(prev => ({ ...prev, gender: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Unisex">Unisex</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Volume (ml)</Label><Input type="number" value={formData.volume} onChange={(e) => setFormData(prev => ({ ...prev, volume: e.target.value }))} /></div>
                      <div className="space-y-2">
                        <Label>Concentration</Label>
                        <Select value={formData.concentration} onValueChange={(v) => setFormData(prev => ({ ...prev, concentration: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="EDP">EDP</SelectItem><SelectItem value="EDT">EDT</SelectItem><SelectItem value="Parfum">Parfum</SelectItem><SelectItem value="Cologne">Cologne</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} /></div>
                  </div>
                </div>
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Save"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          {onClose && <Button variant="outline" onClick={onClose}>Back</Button>}
        </div>
      </div>

      <Card className="bg-card/50 border-primary/10">
        <CardContent className="p-3 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search fragrances..." className="pl-9 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-44 h-9"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>
      ) : (
        <div className="border rounded-lg bg-card/30 backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded border bg-muted/20 flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? <img src={`${SERVER_BASE_URL}${item.imageUrl}`} className="w-full h-full object-contain p-1" /> : <Search className="w-4 h-4 opacity-20" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">{item.gender} | {item.volume}ml</div>
                  </TableCell>
                  <TableCell className="text-sm">{item.brand}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] font-normal">{item.category}</Badge></TableCell>
                  <TableCell className="text-sm font-bold">₹{item.price.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{item.stockQuantity}</TableCell>
                  <TableCell>
                    <Switch checked={item.inStock} onCheckedChange={() => handleToggleStock(item, item.inStock)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(item)}><Edit className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {items.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No fragrances found.</div>
          )}
        </div>
      )}
      
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 py-4">
          <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
          <span className="text-sm">Page {currentPage} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
