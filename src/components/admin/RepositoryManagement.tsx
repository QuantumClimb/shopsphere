import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Edit, Plus, Search, MoreVertical, ShoppingBag, ArrowRight, X } from "lucide-react";
import { API_BASE_URL, SERVER_BASE_URL } from "@/lib/apiConfig";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RepositoryManagementProps {
  onClose?: () => void;
}

interface MasterFragrance {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  volume: number;
  concentration: string;
  gender: string;
  fragranceFamily: string;
  topNotes: string;
  middleNotes: string;
  baseNotes: string;
  categoryId: number;
  category: string;
  imageUrl: string;
}

export default function RepositoryManagement({ onClose }: RepositoryManagementProps) {
  const [items, setItems] = useState<MasterFragrance[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterFragrance | null>(null);
  
  // Add to Stock Dialog
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [stockItem, setStockItem] = useState<MasterFragrance | null>(null);
  const [stockData, setStockData] = useState({ price: "", stockQuantity: "10" });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

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
    categoryId: "",
    imageUrl: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchItems(); }, [currentPage, selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      setCategories(await response.json());
    } catch (err) { setError('Failed to load categories'); }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage.toString(), limit: '20' });
      if (selectedCategory !== "all") params.append('category', selectedCategory);
      if (searchQuery) params.append('q', searchQuery);
      
      const response = await fetch(`${API_BASE_URL}/admin/repository?${params}`);
      if (!response.ok) throw new Error('Failed to fetch repository');
      const data = await response.json();
      setItems(data.items);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (err) { setError('Failed to load repository'); setLoading(false); }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<{imageData: string, imageMimeType: string, imageSize: number} | null> => {
    if (!imageFile) return null;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', imageFile);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/upload-image`, { method: 'POST', body: fd });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Upload failed');
      }
      const data = await response.json();
      setUploading(false);
      return data;
    } catch (err) { setUploading(false); throw err; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      let finalImageUrl = formData.imageUrl;
      let finalImageData = undefined;
      let finalImageMimeType = undefined;
      let finalImageSize = undefined;
      
      if (imageFile) {
        const uploadResult = await uploadImage();
        if (uploadResult) {
          finalImageData = uploadResult.imageData;
          finalImageMimeType = uploadResult.imageMimeType;
          finalImageSize = uploadResult.imageSize;
          finalImageUrl = ""; // Clear static URL so it uses the DB image
        }
      }
      const submitData = { 
        ...formData, 
        price: parseFloat(formData.price), 
        volume: parseFloat(formData.volume), 
        imageUrl: finalImageUrl,
        imageData: finalImageData,
        imageMimeType: finalImageMimeType,
        imageSize: finalImageSize
      };
      const url = editingItem ? `${API_BASE_URL}/admin/repository/${editingItem.id}` : `${API_BASE_URL}/admin/repository`;
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      if (!response.ok) throw new Error('Failed to save');
      fetchItems();
      resetForm();
      setIsDialogOpen(false);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to save'); }
  };

  const handleAddToStock = async () => {
    if (!stockItem) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/inventory/add-from-repository/${stockItem.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: parseFloat(stockData.price),
          stockQuantity: parseInt(stockData.stockQuantity)
        })
      });
      if (!response.ok) throw new Error('Failed to add to stock');
      setIsStockDialogOpen(false);
      alert(`${stockItem.name} added to live inventory!`);
    } catch (err) { setError('Failed to add to stock'); }
  };

  const handleEdit = (item: MasterFragrance) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      brand: item.brand || "",
      description: item.description || "",
      price: (item.price || "").toString(),
      volume: (item.volume || 100).toString(),
      concentration: item.concentration || "EDP",
      gender: item.gender || "Unisex",
      fragranceFamily: item.fragranceFamily || "",
      topNotes: item.topNotes || "",
      middleNotes: item.middleNotes || "",
      baseNotes: item.baseNotes || "",
      categoryId: item.categoryId.toString(),
      imageUrl: item.imageUrl || ""
    });
    setImagePreview(item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${SERVER_BASE_URL}${item.imageUrl}`) : "");
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "", brand: "", description: "", price: "", volume: "100", concentration: "EDP", gender: "Unisex", fragranceFamily: "", topNotes: "", middleNotes: "", baseNotes: "", categoryId: "", imageUrl: "" });
    setEditingItem(null);
    setImageFile(null);
    setImagePreview("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Fragrance Repository</h2>
          <p className="text-foreground/70 text-sm">Master library of all fragrances (not necessarily in stock)</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}><Plus className="w-4 h-4 mr-2" />Add Master Record</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingItem ? 'Edit' : 'Add'} Master Fragrance</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Image</Label>
                      <div className="flex flex-col space-y-2">
                        {imagePreview && (
                          <div className="relative w-32 h-32 border rounded overflow-hidden">
                            <img src={imagePreview} className="w-full h-full object-contain" />
                            <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => {setImagePreview(""); setImageFile(null);}}><X className="w-3 h-3" /></Button>
                          </div>
                        )}
                        <Input type="file" accept="image/*" onChange={handleImageSelect} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Brand</Label><Input value={formData.brand} onChange={(e) => setFormData(p => ({ ...p, brand: e.target.value }))} required /></div>
                      <div className="space-y-2"><Label>Sug. Price (₹)</Label><Input type="number" value={formData.price} onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={formData.categoryId} onValueChange={(v) => setFormData(p => ({ ...p, categoryId: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select value={formData.gender} onValueChange={(v) => setFormData(p => ({ ...p, gender: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Unisex">Unisex</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Volume (ml)</Label><Input type="number" value={formData.volume} onChange={(e) => setFormData(p => ({ ...p, volume: e.target.value }))} /></div>
                      <div className="space-y-2">
                        <Label>Concentration</Label>
                        <Select value={formData.concentration} onValueChange={(v) => setFormData(p => ({ ...p, concentration: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="EDP">EDP</SelectItem><SelectItem value="EDT">EDT</SelectItem><SelectItem value="Parfum">Parfum</SelectItem><SelectItem value="Cologne">Cologne</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
                  </div>
                </div>
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Save Master"}</Button>
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
            <Input placeholder="Search repository..." className="pl-9 h-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                <TableHead>Sug. Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="w-12 h-16 rounded border bg-muted/20 flex items-center justify-center overflow-hidden">
                      {item.imageUrl ? <img src={item.imageUrl.startsWith('http') ? item.imageUrl : `${SERVER_BASE_URL}${item.imageUrl}`} className="w-full h-full object-contain p-1" /> : <Search className="w-4 h-4 opacity-20" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">{item.gender} | {item.volume}ml</div>
                  </TableCell>
                  <TableCell className="text-sm">{item.brand}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[10px] font-normal">{item.category}</Badge></TableCell>
                  <TableCell className="text-sm font-bold text-muted-foreground">₹{item.price?.toLocaleString() || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="secondary" className="h-8 px-2" onClick={() => { setStockItem(item); setStockData({ price: item.price?.toString() || "", stockQuantity: "10" }); setIsStockDialogOpen(true); }}>
                        <Plus className="w-3 h-3 mr-1" /> Add to Stock
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(item)}><Edit className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={async () => { if(confirm('Delete from master repository?')) { await fetch(`${API_BASE_URL}/admin/repository/${item.id}`, { method: 'DELETE' }); fetchItems(); } }}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add to Stock Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to In-Stock Inventory</DialogTitle>
            <DialogDescription>Move "{stockItem?.name}" from repository to live shop.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Price (₹)</Label>
              <Input className="col-span-3" type="number" value={stockData.price} onChange={(e) => setStockData(p => ({ ...p, price: e.target.value }))} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Quantity</Label>
              <Input className="col-span-3" type="number" value={stockData.stockQuantity} onChange={(e) => setStockData(p => ({ ...p, stockQuantity: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddToStock}>Activate in Shop</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
