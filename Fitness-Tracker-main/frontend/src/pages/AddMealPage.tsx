import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, Search, Plus, User, Globe, Utensils, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/services/api";
import foodService, {type FoodItem } from "@/services/food.service";

// Backend DTOs
interface FoodCreateRequest {
    name: string;
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
}

interface FoodLogCreateRequest {
    foodId: number;
    quantityGrams: number;
    caloriesConsumed?: number;
}

const AddMeal = () => {
    const navigate = useNavigate();
    const [isPersonal, setIsPersonal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [amount, setAmount] = useState("100");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [foodToDelete, setFoodToDelete] = useState<FoodItem | null>(null);

    // Data state
    const [externalFoods, setExternalFoods] = useState<FoodItem[]>([]);
    const [personalFoods, setPersonalFoods] = useState<FoodItem[]>([]);
    const [usdaSearchResults, setUsdaSearchResults] = useState<FoodItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearchingUSDA, setIsSearchingUSDA] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isLogging, setIsLogging] = useState(false);

    // Create food dialog
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newFood, setNewFood] = useState<FoodCreateRequest>({
        name: "",
        calories: 0,
        carbs: 0,
        protein: 0,
        fats: 0,
    });

    // Fetch foods on mount and tab change
    useEffect(() => {
        if (isPersonal) {
            fetchPersonalFoods();
        } else {
            fetchExternalFoods();
        }
    }, [isPersonal]);

    // USDA search with debounce for External tab
    useEffect(() => {
        if (!isPersonal && searchQuery.trim().length >= 3) {
            const timeoutId = setTimeout(() => {
                searchUSDAFoods(searchQuery);
            }, 500); // Debounce 500ms


            return () => clearTimeout(timeoutId);
        } else if (!isPersonal && searchQuery.trim().length === 0) {
            setUsdaSearchResults([]);
        }
    }, [searchQuery, isPersonal]);

    const fetchExternalFoods = async () => {
        setIsLoading(true);
        try {
            const response = await api.get<FoodItem[]>("/foods/external");
            setExternalFoods(response.data);
        } catch (error: any) {
            console.error("Error fetching external foods:", error);
            toast.error("Failed to load external foods", {
                description: error.response?.data || "Please try again",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPersonalFoods = async () => {
        setIsLoading(true);
        try {
            const response = await api.get<FoodItem[]>("/foods/personal");
            setPersonalFoods(response.data);
        } catch (error: any) {
            console.error("Error fetching personal foods:", error);
            toast.error("Failed to load personal foods", {
                description: error.response?.data || "Please try again",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteFood = async () => {
        if (!foodToDelete?.id) return;

        try {
            await foodService.deleteFood(foodToDelete.id);
            toast.success(`Deleted "${foodToDelete.name}"`);
            await fetchPersonalFoods(); // Reload the list
            setDeleteDialogOpen(false);
            setFoodToDelete(null);
        } catch (error) {
            console.error('Failed to delete food:', error);
            toast.error("Failed to delete food");
        }
    };

    const searchUSDAFoods = async (query: string) => {
        setIsSearchingUSDA(true);
        try {
            const results = await foodService.searchUSDAFoods(query, 20);
            setUsdaSearchResults(results);
        } catch (error) {
            console.error("Error searching USDA foods:", error);
            toast.error("Failed to search USDA database", {
                description: "Please try again",
            });
            setUsdaSearchResults([]);
        } finally {
            setIsSearchingUSDA(false);
        }
    };

    // Combine database foods with USDA search results for External tab
    const foods = isPersonal ? personalFoods : [
        ...externalFoods,
        ...usdaSearchResults
    ];

    // Client-side filtering for both tabs
    const filteredFoods = isPersonal
        ? foods.filter((food) =>
            food.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : searchQuery.trim().length >= 3
            ? foods.filter((food) =>
                food.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            : []; // External tab: show nothing if search query < 3 chars

    const handleSelectFood = (food: FoodItem) => {
        setSelectedFood(food);
        setAmount("100");
        setDialogOpen(true);
    };

    const handleLogMeal = async () => {
        if (!selectedFood) return;

        setIsLogging(true);
        try {
            const quantityGrams = parseFloat(amount);

            if (quantityGrams <= 0 || isNaN(quantityGrams)) {
                toast.error("Invalid amount", {
                    description: "Amount must be greater than 0",
                });
                setIsLogging(false);
                return;
            }

            // Check if it's a USDA/external food
            if (selectedFood.source === "EXTERNAL" || !selectedFood.id) {
                // Use the external food logging endpoint
                const externalLogRequest = {
                    foodName: selectedFood.name,
                    calories: selectedFood.calories,
                    protein: selectedFood.protein,
                    fats: selectedFood.fats,
                    carbs: selectedFood.carbs,
                    quantityGrams: quantityGrams,
                };

                await api.post("/food-logs/external", externalLogRequest);

                const multiplier = quantityGrams / 100;
                const loggedCalories = Math.round(selectedFood.calories * multiplier);

                toast.success(`Logged ${selectedFood.name}`, {
                    description: `${amount}g - ${loggedCalories} kcal (from USDA)`,
                });
            } else {
                // It's a personal or already-saved food, use the regular endpoint
                const logRequest: FoodLogCreateRequest = {
                    foodId: selectedFood.id,
                    quantityGrams: quantityGrams,
                };

                await api.post("/food-logs", logRequest);

                const multiplier = quantityGrams / 100;
                const loggedCalories = Math.round(selectedFood.calories * multiplier);

                toast.success(`Logged ${selectedFood.name}`, {
                    description: `${amount}g - ${loggedCalories} kcal`,
                });
            }

            setDialogOpen(false);
            setSelectedFood(null);

            setTimeout(() => navigate("/food"), 500);

        } catch (error: any) {
            console.error("Error logging meal:", error);
            toast.error("Failed to log meal", {
                description: error.response?.data || "Please try again",
            });
        } finally {
            setIsLogging(false);
        }
    };

    const handleCreateFood = async () => {
        if (!newFood.name.trim()) {
            toast.error("Please enter a food name");
            return;
        }

        if (newFood.calories < 0 || newFood.protein < 0 || newFood.fats < 0 || newFood.carbs < 0) {
            toast.error("Values cannot be negative");
            return;
        }

        setIsCreating(true);
        try {
            const response = await api.post<FoodItem>("/foods", newFood);
            setPersonalFoods((prev) => [response.data, ...prev]);

            toast.success(`Created "${response.data.name}"`, {
                description: "Added to your personal foods",
            });

            setNewFood({
                name: "",
                calories: 0,
                carbs: 0,
                protein: 0,
                fats: 0,
            });
            setCreateDialogOpen(false);

        } catch (error: any) {
            console.error("Error creating food:", error);
            toast.error("Failed to create food", {
                description: error.response?.data || "Please try again",
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container px-4 md:px-8 py-8 pb-24 md:pb-8">
                <div className="flex items-center gap-4 mb-6 animate-fade-in">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/food")}
                        className="shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Add Meal</h1>
                        <p className="text-muted-foreground text-sm">
                            {isPersonal ? "Search your personal foods" : "Search USDA FoodData Central (350k+ foods)"}
                        </p>
                    </div>
                    {isPersonal && (
                        <Button
                            variant="calorie"
                            size="sm"
                            className="gap-2"
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Create Food</span>
                        </Button>
                    )}
                </div>

                {/* Toggle and Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
                    <div className="flex bg-secondary rounded-lg p-1 w-fit">
                        <button
                            onClick={() => {
                                setIsPersonal(false);
                                setSearchQuery("");
                                setUsdaSearchResults([]);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                !isPersonal
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Globe className="w-4 h-4" />
                            External
                        </button>
                        <button
                            onClick={() => {
                                setIsPersonal(true);
                                setSearchQuery("");
                                setUsdaSearchResults([]);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                isPersonal
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <User className="w-4 h-4" />
                            Personal
                        </button>
                    </div>

                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder={isPersonal ? "Search your foods..." : "Search USDA database (min 3 chars)..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                        {isSearchingUSDA && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                        )}
                    </div>
                </div>

                {/* Food Table */}
                <div className="bg-card rounded-xl border border-border/50 overflow-hidden animate-fade-in" style={{ animationDelay: "150ms" }}>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-secondary/50">
                                <TableHead className="font-semibold">Food</TableHead>
                                <TableHead className="text-right font-semibold">Calories</TableHead>
                                <TableHead className="text-right font-semibold hidden sm:table-cell">Carbs</TableHead>
                                <TableHead className="text-right font-semibold hidden sm:table-cell">Protein</TableHead>
                                <TableHead className="text-right font-semibold hidden md:table-cell">Fat</TableHead>
                                <TableHead className="text-right font-semibold">Per 100g</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(isLoading || isSearchingUSDA) ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {isSearchingUSDA ? "Searching USDA database..." : "Loading..."}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : filteredFoods.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        {isPersonal ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <Utensils className="w-8 h-8 text-muted-foreground/50" />
                                                <p>No personal foods found.</p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCreateDialogOpen(true)}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Create your first food
                                                </Button>
                                            </div>
                                        ) : searchQuery.trim().length >= 3 ? (
                                            <>
                                                <Utensils className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                                                <p>No results found for "{searchQuery}"</p>
                                                <p className="text-sm mt-1">Try a different search term</p>
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                                                <p>Start typing to search the USDA database</p>
                                                <p className="text-sm mt-1">350,000+ foods available</p>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredFoods.map((food, index) => (
                                    <TableRow
                                        key={food.id || `usda-${index}`}
                                        className="cursor-pointer hover:bg-secondary/50 transition-colors"
                                        onClick={() => handleSelectFood(food)}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {food.name}
                                                {food.source === "PERSONAL" && (
                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                        Custom
                                                    </span>
                                                )}
                                                {food.source === "EXTERNAL" && (
                                                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                                                        USDA
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-calorie font-semibold">
                                            {food.calories}
                                        </TableCell>
                                        <TableCell className="text-right hidden sm:table-cell">{food.carbs.toFixed(1)}g</TableCell>
                                        <TableCell className="text-right hidden sm:table-cell">{food.protein.toFixed(1)}g</TableCell>
                                        <TableCell className="text-right hidden md:table-cell">{food.fats.toFixed(1)}g</TableCell>
                                        <TableCell className="text-right text-muted-foreground text-sm">
                                            100g
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectFood(food);
                                                    }}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>

                                                {food.source === "PERSONAL" && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setFoodToDelete(food);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Log Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Log {selectedFood?.name}</DialogTitle>
                        </DialogHeader>

                        {selectedFood && (
                            <div className="space-y-4">
                                {!selectedFood.id && (
                                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                        <p className="text-sm text-blue-900 dark:text-blue-100">
                                            This food will be saved to your database when you log it
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-4 gap-3 text-center">
                                    <div className="bg-secondary/50 rounded-lg p-3">
                                        <p className="text-lg font-bold text-calorie">
                                            {Math.round(selectedFood.calories * (parseFloat(amount) / 100))}
                                        </p>
                                        <p className="text-xs text-muted-foreground">kcal</p>
                                    </div>
                                    <div className="bg-secondary/50 rounded-lg p-3">
                                        <p className="text-lg font-bold">
                                            {Math.round(selectedFood.carbs * (parseFloat(amount) / 100))}g
                                        </p>
                                        <p className="text-xs text-muted-foreground">Carbs</p>
                                    </div>
                                    <div className="bg-secondary/50 rounded-lg p-3">
                                        <p className="text-lg font-bold">
                                            {Math.round(selectedFood.protein * (parseFloat(amount) / 100))}g
                                        </p>
                                        <p className="text-xs text-muted-foreground">Protein</p>
                                    </div>
                                    <div className="bg-secondary/50 rounded-lg p-3">
                                        <p className="text-lg font-bold">
                                            {Math.round(selectedFood.fats * (parseFloat(amount) / 100))}g
                                        </p>
                                        <p className="text-xs text-muted-foreground">Fat</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount (grams)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        min="1"
                                        step="1"
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isLogging}>
                                Cancel
                            </Button>
                            <Button variant="calorie" onClick={handleLogMeal} disabled={isLogging}>
                                {isLogging ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Logging...
                                    </>
                                ) : (
                                    "Log Meal"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Create Food Dialog */}
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Utensils className="w-5 h-5" />
                                Create Custom Food
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="foodName">Food Name *</Label>
                                <Input
                                    id="foodName"
                                    placeholder="e.g., Grandma's Apple Pie"
                                    value={newFood.name}
                                    onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="calories">Calories (per 100g) *</Label>
                                <Input
                                    id="calories"
                                    type="number"
                                    placeholder="0"
                                    value={newFood.calories || ""}
                                    onChange={(e) => setNewFood({ ...newFood, calories: parseFloat(e.target.value) || 0 })}
                                    min="0"
                                    step="1"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="carbs">Carbs (g)</Label>
                                    <Input
                                        id="carbs"
                                        type="number"
                                        placeholder="0"
                                        value={newFood.carbs || ""}
                                        onChange={(e) => setNewFood({ ...newFood, carbs: parseFloat(e.target.value) || 0 })}
                                        min="0"
                                        step="0.1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="protein">Protein (g)</Label>
                                    <Input
                                        id="protein"
                                        type="number"
                                        placeholder="0"
                                        value={newFood.protein || ""}
                                        onChange={(e) => setNewFood({ ...newFood, protein: parseFloat(e.target.value) || 0 })}
                                        min="0"
                                        step="0.1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fat">Fat (g)</Label>
                                    <Input
                                        id="fat"
                                        type="number"
                                        placeholder="0"
                                        value={newFood.fats || ""}
                                        onChange={(e) => setNewFood({ ...newFood, fats: parseFloat(e.target.value) || 0 })}
                                        min="0"
                                        step="0.1"
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            {newFood.name && (
                                <div className="bg-secondary/50 rounded-lg p-4">
                                    <p className="text-sm text-muted-foreground mb-2">Preview (per 100g)</p>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{newFood.name}</span>
                                        <span className="text-calorie font-semibold">
                                            {newFood.calories || 0} kcal
                                        </span>
                                    </div>
                                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                                        <span>C: {newFood.carbs || 0}g</span>
                                        <span>P: {newFood.protein || 0}g</span>
                                        <span>F: {newFood.fats || 0}g</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isCreating}>
                                Cancel
                            </Button>
                            <Button variant="calorie" onClick={handleCreateFood} disabled={isCreating}>
                                {isCreating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Food"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete {foodToDelete?.name}?</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                            This action cannot be undone. This will permanently delete this custom food item.
                        </p>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setDeleteDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteFood}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
};

export default AddMeal;