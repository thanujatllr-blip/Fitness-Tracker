import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, Search, Plus, User, Globe, Dumbbell, Loader2, Flame, Trash2 } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import exerciseService from "@/services/exercise.service";
import type { Exercise, ExerciseCreateRequest, ExerciseLogCreateRequest, ExternalExerciseLogCreateRequest } from "@/services/exercise.service";

// Database constraints
const EXERCISE_CATEGORIES = [
    "Chest",
    "Arms",
    "Back",
    "Legs",
    "Core",
    "Full Body",
    "Shoulders",
    "Cardio"
] as const;

const EXERCISE_TYPES = ["CARDIO", "STRENGTH"] as const;

type ExerciseCategory = typeof EXERCISE_CATEGORIES[number];
type ExerciseType = typeof EXERCISE_TYPES[number];

const LogWorkout = () => {
    const navigate = useNavigate();
    const [isPersonal, setIsPersonal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [logDialogOpen, setLogDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);

    // Backend data
    const [externalExercises, setExternalExercises] = useState<Exercise[]>([]);
    const [personalExercises, setPersonalExercises] = useState<Exercise[]>([]);
    const [wgerExercises, setWgerExercises] = useState<Exercise[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isLogging, setIsLogging] = useState(false);
    const [isSearchingWger, setIsSearchingWger] = useState(false);

    // Create exercise form state
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newExercise, setNewExercise] = useState<ExerciseCreateRequest>({
        name: "",
        category: "Chest",
        exerciseType: "STRENGTH",
        caloriesBurned: 0,
    });

    // Log workout form state
    const [logForm, setLogForm] = useState({
        durationMinutes: 0,
        sets: 1,
        reps: 10,
        weightUsed: 0,
    });

    // Fetch exercises from backend
    useEffect(() => {
        fetchExercises();
    }, [isPersonal]);

    const fetchExercises = async () => {
        setIsLoading(true);
        try {
            if (isPersonal) {
                const data = await exerciseService.getPersonalExercises();
                setPersonalExercises(data);
            } else {
                const data = await exerciseService.getExternalExercises();
                setExternalExercises(data);
            }
        } catch (error: any) {
            console.error("Error fetching exercises:", error);
            toast.error("Failed to load exercises", {
                description: error.response?.data || "Please try again",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteExercise = async () => {
        if (!exerciseToDelete?.id) return;

        try {
            await exerciseService.deleteExercise(exerciseToDelete.id);
            toast.success(`Deleted "${exerciseToDelete.name}"`);
            await fetchExercises(); // Reload the list
            setDeleteDialogOpen(false);
            setExerciseToDelete(null);
        } catch (error) {
            console.error('Failed to delete exercise:', error);
            toast.error("Failed to delete exercise");
        }
    };

    // Wger search with debouncing (External tab only)
    useEffect(() => {
        // Clear Wger results when switching to Personal tab or clearing search
        if (isPersonal || !searchQuery.trim()) {
            setWgerExercises([]);
            return;
        }

        // Debounce the Wger API call
        const debounceTimer = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                setIsSearchingWger(true);
                try {
                    const results = await exerciseService.searchWgerExercises(searchQuery.trim(), 20);
                    setWgerExercises(results);
                } catch (error) {
                    console.error("Error searching Wger:", error);
                    setWgerExercises([]);
                } finally {
                    setIsSearchingWger(false);
                }
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, isPersonal]);

    // Filter by search query
    const filteredLocalExercises = (isPersonal ? personalExercises : externalExercises).filter(
        (exercise) => exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

// Also filter Wger results
    const filteredWgerExercises = wgerExercises.filter(
        (exercise) => exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

// External tab: show NOTHING unless search is 3+ characters
    const filteredExercises = isPersonal
        ? filteredLocalExercises
        : searchQuery.trim().length >= 3
            ? [...filteredLocalExercises, ...filteredWgerExercises]
            : [];  // Empty when no search

    // Check if an exercise is from Wger (has null id)
    const isWgerExercise = (exercise: Exercise): boolean => {
        return exercise.id === null || exercise.id === undefined;
    };

    // Handle exercise selection for logging
    const handleSelectExercise = (exercise: Exercise) => {
        setSelectedExercise(exercise);
        setLogDialogOpen(true);
        // Reset form
        setLogForm({
            durationMinutes: exercise.exerciseType === "CARDIO" ? 30 : 0,
            sets: exercise.exerciseType === "STRENGTH" ? 3 : 0,
            reps: exercise.exerciseType === "STRENGTH" ? 10 : 0,
            weightUsed: exercise.exerciseType === "STRENGTH" ? 0 : 0,
        });
    };

    // Calculate calorie preview
    const calculateCaloriePreview = (): number => {
        if (!selectedExercise) return 0;

        if (selectedExercise.exerciseType === "CARDIO") {
            return Math.round(logForm.durationMinutes * selectedExercise.caloriesBurntPerMinute);
        } else {
            // STRENGTH: Estimate duration from sets/reps
            // Formula: sets * (reps * 0.05 + 1.5) minutes
            const estimatedMinutes = logForm.sets * (logForm.reps * 0.05 + 1.5);
            return Math.round(estimatedMinutes * selectedExercise.caloriesBurntPerMinute);
        }
    };

    // Log workout
    const handleLogWorkout = async () => {
        if (!selectedExercise) return;

        // Validation
        if (selectedExercise.exerciseType === "CARDIO") {
            if (logForm.durationMinutes <= 0) {
                toast.error("Please enter a valid duration");
                return;
            }
        } else {
            if (logForm.sets < 1 || logForm.reps < 1) {
                toast.error("Sets and reps must be at least 1");
                return;
            }
            if (logForm.weightUsed < 0) {
                toast.error("Weight cannot be negative");
                return;
            }
        }

        setIsLogging(true);
        try {
            // Check if it's a Wger/external exercise (no ID or source is EXTERNAL)
            if (selectedExercise.source === "EXTERNAL" || !selectedExercise.id) {
                // Use the external exercise logging endpoint
                const externalLogRequest: ExternalExerciseLogCreateRequest = {
                    exerciseName: selectedExercise.name,
                    category: selectedExercise.category,
                    exerciseType: selectedExercise.exerciseType,
                    caloriesBurntPerMinute: selectedExercise.caloriesBurntPerMinute,
                    durationMinutes: selectedExercise.exerciseType === "CARDIO" ? logForm.durationMinutes : null,
                    sets: selectedExercise.exerciseType === "STRENGTH" ? logForm.sets : 0,
                    reps: selectedExercise.exerciseType === "STRENGTH" ? logForm.reps : 0,
                    weightUsed: selectedExercise.exerciseType === "STRENGTH" ? logForm.weightUsed : 0,
                };

                await exerciseService.createExternalExerciseLog(externalLogRequest);

                toast.success("Workout logged!", {
                    description: `${selectedExercise.name} - ${calculateCaloriePreview()} kcal (from Wger)`,
                });
            } else {
                // It's a personal exercise, use the regular endpoint
                const logData: ExerciseLogCreateRequest = {
                    exerciseId: selectedExercise.id,
                    durationMinutes: selectedExercise.exerciseType === "CARDIO" ? logForm.durationMinutes : null,
                    sets: selectedExercise.exerciseType === "STRENGTH" ? logForm.sets : 0,
                    reps: selectedExercise.exerciseType === "STRENGTH" ? logForm.reps : 0,
                    weightUsed: selectedExercise.exerciseType === "STRENGTH" ? logForm.weightUsed : 0,
                };

                await exerciseService.createExerciseLog(logData);

                toast.success("Workout logged!", {
                    description: `${selectedExercise.name} - ${calculateCaloriePreview()} kcal`,
                });
            }

            setLogDialogOpen(false);
            navigate("/exercise");
        } catch (error: any) {
            console.error("Error logging workout:", error);
            toast.error("Failed to log workout", {
                description: error.response?.data || "Please try again",
            });
        } finally {
            setIsLogging(false);
        }
    };
    // Create custom exercise
    const handleCreateExercise = async () => {
        // Validation
        if (!newExercise.name.trim()) {
            toast.error("Please enter an exercise name");
            return;
        }
        if (newExercise.caloriesBurned <= 0) {
            toast.error("Calories burned per minute must be greater than 0");
            return;
        }

        setIsCreating(true);
        try {
            const created = await exerciseService.createExercise(newExercise);

            toast.success("Exercise created!", {
                description: `${created.name} added to your personal exercises`,
            });

            // Add to personal exercises list
            setPersonalExercises((prev) => [...prev, created]);

            // Reset form
            setNewExercise({
                name: "",
                category: "Chest",
                exerciseType: "STRENGTH",
                caloriesBurned: 0,
            });

            setCreateDialogOpen(false);
        } catch (error: any) {
            console.error("Error creating exercise:", error);
            toast.error("Failed to create exercise", {
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
                        onClick={() => navigate("/exercise")}
                        className="shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5"/>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Log Workout</h1>
                        <p className="text-muted-foreground text-sm">
                            {isPersonal ? "Search and log your personal exercises" : "Search Wger Exercise API"}
                        </p>
                    </div>
                    {isPersonal && (
                        <Button
                            variant="exercise"
                            size="sm"
                            className="gap-2"
                            onClick={() => setCreateDialogOpen(true)}
                        >
                            <Plus className="w-4 h-4"/>
                            <span className="hidden sm:inline">Create Exercise</span>
                        </Button>
                    )}
                </div>

                {/* Toggle and Search */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
                    <div className="flex bg-secondary rounded-lg p-1 w-fit">
                        <button
                            onClick={() => setIsPersonal(false)}
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
                            onClick={() => setIsPersonal(true)}
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
                            placeholder={isPersonal ? "Search your exercises..." : "Search Wger database (min 3 chars)..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Exercise Table */}
                <div className="bg-card rounded-xl border border-border/50 overflow-hidden animate-fade-in" style={{ animationDelay: "150ms" }}>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-secondary/50">
                                <TableHead className="font-semibold">Exercise</TableHead>
                                <TableHead className="font-semibold hidden sm:table-cell">Category</TableHead>
                                <TableHead className="text-right font-semibold">Cal/min</TableHead>
                                <TableHead className="font-semibold hidden md:table-cell">Type</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredExercises.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        {isPersonal ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <Dumbbell className="w-8 h-8 text-muted-foreground/50" />
                                                <p>No personal exercises found.</p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCreateDialogOpen(true)}
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Create your first exercise
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <Dumbbell className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                                                <p>No exercises found.</p>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <>
                                    {filteredExercises.map((exercise, index) => (
                                        <TableRow
                                            key={isWgerExercise(exercise) ? `wger-${index}-${exercise.name}` : exercise.id}
                                            className="cursor-pointer hover:bg-secondary/50 transition-colors"
                                            onClick={() => handleSelectExercise(exercise)}
                                        >
                                            {/* UPDATED NAME COLUMN UI */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${
                                                        exercise.exerciseType === "CARDIO"
                                                            ? "bg-calorie-light text-calorie"
                                                            : "bg-exercise-light text-exercise"
                                                    }`}>
                                                        <Dumbbell className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{exercise.name}</span>
                                                        {exercise.source === "PERSONAL" && (
                                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                                Custom
                                                            </span>
                                                        )}
                                                        {isWgerExercise(exercise) && (
                                                            <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">
                                                                Wger
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                                                {exercise.category}
                                            </TableCell>

                                            <TableCell className="text-right text-exercise font-semibold">
                                                {exercise.caloriesBurntPerMinute.toFixed(1)}
                                            </TableCell>

                                            {/* UPDATED TYPE COLUMN UI */}
                                            <TableCell className="hidden md:table-cell">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    exercise.exerciseType === "CARDIO"
                                                        ? "bg-calorie-light text-calorie"
                                                        : "bg-exercise-light text-exercise"
                                                }`}>
                                                    {exercise.exerciseType === "CARDIO" ? "Cardio" : "Strength"}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSelectExercise(exercise);
                                                        }}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>

                                                    {exercise.source === "PERSONAL" && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                                            //opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-lg
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExerciseToDelete(exercise);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {/* Wger search loading indicator */}
                                    {isSearchingWger && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-4">
                                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span className="text-sm">Searching Wger database...</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Log Workout Dialog */}
                <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Dumbbell className="w-5 h-5" />
                                {selectedExercise?.name}
                            </DialogTitle>
                        </DialogHeader>

                        {selectedExercise && (
                            <div className="space-y-4">

                                {/* Calorie preview */}
                                <div className="flex items-center justify-center gap-4 p-4 bg-secondary/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Flame className="w-5 h-5 text-calorie" />
                                        <span className="text-2xl font-bold text-calorie">{calculateCaloriePreview()}</span>
                                        <span className="text-muted-foreground">kcal</span>
                                    </div>
                                    <div className="h-6 w-px bg-border" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Cal/Min:</span>
                                        <span className="font-semibold">{selectedExercise.caloriesBurntPerMinute}</span>
                                    </div>
                                </div>

                                {/* CARDIO Inputs */}
                                {selectedExercise.exerciseType === "CARDIO" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Duration (minutes)</Label>
                                        <Input
                                            id="duration"
                                            type="number"
                                            placeholder="30"
                                            value={logForm.durationMinutes || ""}
                                            onChange={(e) =>
                                                setLogForm({ ...logForm, durationMinutes: parseFloat(e.target.value) || 0 })
                                            }
                                            min="0"
                                            step="1"
                                        />
                                    </div>
                                )}

                                {/* STRENGTH Inputs */}
                                {selectedExercise.exerciseType === "STRENGTH" && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="sets">Sets</Label>
                                                <Input
                                                    id="sets"
                                                    type="number"
                                                    placeholder="3"
                                                    value={logForm.sets || ""}
                                                    onChange={(e) =>
                                                        setLogForm({ ...logForm, sets: parseInt(e.target.value) || 1 })
                                                    }
                                                    min="1"
                                                    step="1"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="reps">Reps</Label>
                                                <Input
                                                    id="reps"
                                                    type="number"
                                                    placeholder="10"
                                                    value={logForm.reps || ""}
                                                    onChange={(e) =>
                                                        setLogForm({ ...logForm, reps: parseInt(e.target.value) || 1 })
                                                    }
                                                    min="1"
                                                    step="1"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="weight">Weight (kg)</Label>
                                            <Input
                                                id="weight"
                                                type="number"
                                                placeholder="0"
                                                value={logForm.weightUsed || ""}
                                                onChange={(e) =>
                                                    setLogForm({ ...logForm, weightUsed: parseFloat(e.target.value) || 0 })
                                                }
                                                min="0"
                                                step="0.5"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setLogDialogOpen(false)} disabled={isLogging}>
                                Cancel
                            </Button>
                            <Button variant="exercise" onClick={handleLogWorkout} disabled={isLogging}>
                                {isLogging ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Logging...
                                    </>
                                ) : (
                                    "Log Workout"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Create Exercise Dialog */}
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Dumbbell className="w-5 h-5" />
                                Create Custom Exercise
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="exerciseName">Exercise Name *</Label>
                                <Input
                                    id="exerciseName"
                                    placeholder="e.g., Barbell Bench Press"
                                    value={newExercise.name}
                                    onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={newExercise.category}
                                        onValueChange={(value) => setNewExercise({ ...newExercise, category: value as ExerciseCategory })}
                                    >
                                        <SelectTrigger id="category">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EXERCISE_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Type *</Label>
                                    <Select
                                        value={newExercise.exerciseType}
                                        onValueChange={(value) => setNewExercise({ ...newExercise, exerciseType: value as ExerciseType })}
                                    >
                                        <SelectTrigger id="type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EXERCISE_TYPES.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="caloriesPerMin">Calories per Minute *</Label>
                                <Input
                                    id="caloriesPerMin"
                                    type="number"
                                    placeholder="e.g., 8.5"
                                    value={newExercise.caloriesBurned || ""}
                                    onChange={(e) => setNewExercise({ ...newExercise, caloriesBurned: parseFloat(e.target.value) || 0 })}
                                    min="0"
                                    step="0.1"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Average calories burned per minute
                                </p>
                            </div>

                            {/* Preview */}
                            {newExercise.name && (
                                <div className="bg-secondary/50 rounded-lg p-4">
                                    <p className="text-sm text-muted-foreground mb-2">Preview</p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="font-medium">{newExercise.name}</span>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-xs bg-secondary px-2 py-1 rounded">
                                                    {newExercise.category}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    newExercise.exerciseType === "CARDIO"
                                                        ? "bg-calorie-light text-calorie"
                                                        : "bg-exercise-light text-exercise"
                                                }`}>
                                                    {newExercise.exerciseType}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-calorie font-semibold">
                                            {newExercise.caloriesBurned || 0} cal/min
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isCreating}>
                                Cancel
                            </Button>
                            <Button variant="exercise" onClick={handleCreateExercise} disabled={isCreating}>
                                {isCreating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Exercise"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete {exerciseToDelete?.name}?</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                            This action cannot be undone. This will permanently delete this custom exercise.
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
                                onClick={handleDeleteExercise}
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

export default LogWorkout;