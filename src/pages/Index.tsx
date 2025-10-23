import { useState, useEffect } from 'react';
import { Plus, Target, TrendingUp, Moon, Sun, Trash2 } from 'lucide-react';
import SavingsButton from '@/components/SavingsButton';
import JarVisualization from '@/components/JarVisualization';
import SavingsChart from '@/components/SavingsChart';
import EmotionalInsights from '@/components/EmotionalInsights';
import { BackupSync } from '@/components/BackupSync';
import { NotificationSettings } from '@/components/NotificationSettings';
import { SettingsDialog } from '@/components/SettingsDialog';
import { useSubscription, FREE_LIMITS } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/storage';
import { formatCurrency } from '@/lib/utils';
import logoImg from '@/assets/logo.png';
import { App as CapacitorApp } from '@capacitor/app';

interface Jar {
  id: number;
  name: string;
  target: number;
  saved: number;
  streak: number;
  withdrawn: number;
  notes?: JarNote[];
  records?: TransactionRecord[];
  currency?: string;
  categoryId?: number;
  targetDate?: string;
  createdAt?: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface Note {
  id: number;
  text: string;
  color: string;
}

interface JarNote {
  id: number;
  text: string;
  color: string;
}

interface TransactionRecord {
  id: number;
  type: 'saved' | 'withdrawn';
  amount: number;
  date: Date;
}

const Index = () => {
  const { tier, canUseFeature } = useSubscription();
  const { toast } = useToast();
  const [jars, setJars] = useState<Jar[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJar, setSelectedJar] = useState<Jar | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [newJar, setNewJar] = useState({ name: '', target: '', currency: '€', categoryId: 0, targetDate: '' });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });
  const [addAmount, setAddAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState({ text: '', color: 'yellow' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jarToDelete, setJarToDelete] = useState<Jar | null>(null);
  const [showJarNoteModal, setShowJarNoteModal] = useState(false);
  const [newJarNote, setNewJarNote] = useState({ text: '', color: 'yellow' });
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcTargetAmount, setCalcTargetAmount] = useState('');
  const [calcTargetDate, setCalcTargetDate] = useState('');
  const [dailySavings, setDailySavings] = useState<number | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [selectedJarNoteId, setSelectedJarNoteId] = useState<number | null>(null);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showDeleteCategoryConfirm, setShowDeleteCategoryConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedJars = storage.loadJars();
    const loadedCategories = storage.loadCategories();
    const loadedNotes = storage.loadNotes();
    const loadedDarkMode = storage.loadDarkMode();

    setJars(loadedJars);
    setCategories(loadedCategories);
    setNotes(loadedNotes);
    setDarkMode(loadedDarkMode);
  }, []);

  // Save jars to localStorage whenever they change
  useEffect(() => {
    if (jars.length >= 0) {
      storage.saveJars(jars);
    }
  }, [jars]);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    if (categories.length >= 0) {
      storage.saveCategories(categories);
    }
  }, [categories]);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length >= 0) {
      storage.saveNotes(notes);
    }
  }, [notes]);

  // Save dark mode to localStorage whenever it changes
  useEffect(() => {
    storage.saveDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle Capacitor back button
  useEffect(() => {
    let backButtonListener: any = null;
    
    const setupBackButton = async () => {
      backButtonListener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (selectedJar) {
          // If viewing jar details, go back to home
          setSelectedJar(null);
        } else if (showCreateModal || showCategoryModal || showNoteModal || 
                   showJarNoteModal || showRecordsModal || showDeleteConfirm || showCalculator) {
          // If any modal is open, close it
          setShowCreateModal(false);
          setShowCategoryModal(false);
          setShowNoteModal(false);
          setShowJarNoteModal(false);
          setShowRecordsModal(false);
          setShowDeleteConfirm(false);
          setShowCalculator(false);
        } else if (!canGoBack) {
          // If nothing is open and can't go back, let the default behavior (exit app) happen
          CapacitorApp.exitApp();
        }
      });
    };
    
    setupBackButton();

    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [selectedJar, showCreateModal, showCategoryModal, showNoteModal, 
      showJarNoteModal, showRecordsModal, showDeleteConfirm, showCalculator]);

  // Handle clicks outside notes to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-note-item]')) {
        setSelectedNoteId(null);
        setSelectedJarNoteId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const noteColors: Record<string, { bg: string; border: string }> = {
    yellow: { bg: '#FEFF9C', border: '#E5E67A' },
    pink: { bg: '#FFB3D9', border: '#FF8DC7' },
    skyblue: { bg: '#A8E6FF', border: '#7DD3FC' },
    red: { bg: '#FFA6A6', border: '#FF7979' },
    orange: { bg: '#FFD4A3', border: '#FFA94D' },
    lightgreen: { bg: '#B8F5CD', border: '#86EFAC' }
  };

  const createJar = () => {
    // Feature gate: Check jar limit for free users
    if (tier === 'free' && jars.length >= FREE_LIMITS.maxJars) {
      toast({
        title: 'Jar Limit Reached',
        description: `Free plan is limited to ${FREE_LIMITS.maxJars} jars. Upgrade to Premium for unlimited jars!`,
        variant: 'destructive',
      });
      return;
    }

    if (newJar.name && newJar.target && categories.length > 0) {
      const jar: Jar = {
        id: Date.now(),
        name: newJar.name,
        target: parseFloat(newJar.target),
        saved: 0,
        streak: 0,
        withdrawn: 0,
        notes: [],
        records: [],
        currency: newJar.currency,
        categoryId: newJar.categoryId || categories[0].id,
        targetDate: newJar.targetDate || undefined,
        createdAt: new Date().toISOString(),
      };
      setJars([...jars, jar]);
      setNewJar({ name: '', target: '', currency: '€', categoryId: categories[0].id, targetDate: '' });
      setShowCreateModal(false);
    }
  };

  const createCategory = () => {
    // Feature gate: Check category limit for free users
    if (tier === 'free' && categories.length >= FREE_LIMITS.maxCategories) {
      toast({
        title: 'Category Limit Reached',
        description: `Free plan is limited to ${FREE_LIMITS.maxCategories} categories. Upgrade to Premium for unlimited categories!`,
        variant: 'destructive',
      });
      return;
    }

    if (newCategory.name) {
      const category: Category = {
        id: Date.now(),
        name: newCategory.name,
        icon: ''
      };
      setCategories([...categories, category]);
      setNewCategory({ name: '', icon: '' });
      setShowCategoryModal(false);
    }
  };

  const updateCategory = () => {
    if (editingCategory && editingCategory.name.trim()) {
      const updatedCategories = categories.map(cat =>
        cat.id === editingCategory.id ? editingCategory : cat
      );
      setCategories(updatedCategories);
      setShowEditCategoryModal(false);
      setEditingCategory(null);
    }
  };

  const deleteCategory = (categoryId: number) => {
    // Delete all jars associated with this category
    const updatedJars = jars.filter(jar => jar.categoryId !== categoryId);
    setJars(updatedJars);
    
    // Delete the category
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(updatedCategories);
    
    setShowDeleteCategoryConfirm(false);
    setCategoryToDelete(null);
  };

  const getCategoryJars = (categoryId: number) => {
    return jars.filter(jar => jar.categoryId === categoryId);
  };

  const getCategoryTotal = (categoryId: number) => {
    return getCategoryJars(categoryId).reduce((sum, jar) => sum + jar.saved, 0);
  };

  const getCategoryTarget = (categoryId: number) => {
    return getCategoryJars(categoryId).reduce((sum, jar) => sum + jar.target, 0);
  };

  const addJarNote = () => {
    if (newJarNote.text.trim() && selectedJar) {
      const updatedJars = jars.map(jar => {
        if (jar.id === selectedJar.id) {
          const updatedNotes = [...(jar.notes || []), { id: Date.now(), text: newJarNote.text, color: newJarNote.color }];
          return { ...jar, notes: updatedNotes };
        }
        return jar;
      });
      setJars(updatedJars);
      setSelectedJar(updatedJars.find(j => j.id === selectedJar.id) || null);
      setNewJarNote({ text: '', color: 'yellow' });
      setShowJarNoteModal(false);
    }
  };

  const deleteJarNote = (noteId: number) => {
    if (selectedJar) {
      const updatedJars = jars.map(jar => {
        if (jar.id === selectedJar.id) {
          const updatedNotes = (jar.notes || []).filter(n => n.id !== noteId);
          return { ...jar, notes: updatedNotes };
        }
        return jar;
      });
      setJars(updatedJars);
      setSelectedJar(updatedJars.find(j => j.id === selectedJar.id) || null);
    }
  };

  const addNote = () => {
    // Feature gate: Check sticky note limit for free users
    if (tier === 'free' && notes.length >= FREE_LIMITS.maxStickyNotes) {
      toast({
        title: 'Sticky Note Limit Reached',
        description: `Free plan is limited to ${FREE_LIMITS.maxStickyNotes} sticky notes. Upgrade to Premium for unlimited notes!`,
        variant: 'destructive',
      });
      return;
    }

    if (newNote.text.trim()) {
      setNotes([...notes, { id: Date.now(), text: newNote.text, color: newNote.color }]);
      setNewNote({ text: '', color: 'yellow' });
      setShowNoteModal(false);
    }
  };

  const deleteNote = (noteId: number) => {
    setNotes(notes.filter(n => n.id !== noteId));
  };

  const deleteJar = (jarId: number) => {
    setJars(jars.filter(j => j.id !== jarId));
    setShowDeleteConfirm(false);
    setJarToDelete(null);
    if (selectedJar && selectedJar.id === jarId) {
      setSelectedJar(null);
    }
  };

  const addMoney = () => {
    if (!addAmount || !selectedJar) return;
    const amount = parseFloat(addAmount);
    const updatedJars = jars.map(jar => {
      if (jar.id === selectedJar.id) {
        const newSaved = Math.min(jar.saved + amount, jar.target);
        if (newSaved >= jar.target && jar.saved < jar.target) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
        const newRecord: TransactionRecord = {
          id: Date.now(),
          type: 'saved',
          amount: amount,
          date: new Date()
        };
        return { 
          ...jar, 
          saved: newSaved, 
          streak: jar.streak + 1,
          records: [...(jar.records || []), newRecord]
        };
      }
      return jar;
    });
    setJars(updatedJars);
    setSelectedJar(updatedJars.find(j => j.id === selectedJar.id) || null);
    setAddAmount('');
  };

  const withdrawMoney = () => {
    if (!withdrawAmount || !selectedJar) return;
    const amount = parseFloat(withdrawAmount);
    const updatedJars = jars.map(jar => {
      if (jar.id === selectedJar.id) {
        const newSaved = Math.max(jar.saved - amount, 0);
        const newWithdrawn = jar.withdrawn + amount;
        const newRecord: TransactionRecord = {
          id: Date.now(),
          type: 'withdrawn',
          amount: amount,
          date: new Date()
        };
        return { 
          ...jar, 
          saved: newSaved, 
          withdrawn: newWithdrawn,
          records: [...(jar.records || []), newRecord]
        };
      }
      return jar;
    });
    setJars(updatedJars);
    setSelectedJar(updatedJars.find(j => j.id === selectedJar.id) || null);
    setWithdrawAmount('');
  };

  const getProgress = (jar: Jar) => ((jar.saved / jar.target) * 100).toFixed(1);

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';

  const chartData = jars.map(jar => ({
    name: jar.name.length > 10 ? jar.name.substring(0, 10) + '...' : jar.name,
    saved: jar.saved,
    withdrawn: jar.withdrawn
  }));

  const totalSaved = jars.reduce((sum, jar) => sum + jar.saved, 0);
  const totalTarget = jars.reduce((sum, jar) => sum + jar.target, 0);

  const calculateDailySavings = () => {
    if (calcTargetAmount && calcTargetDate) {
      const target = parseFloat(calcTargetAmount);
      const targetDate = new Date(calcTargetDate);
      const today = new Date();
      const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining > 0) {
        setDailySavings(target / daysRemaining);
      } else {
        setDailySavings(null);
      }
    }
  };

  const getInvestmentPlan = (jar: Jar) => {
    const remaining = jar.target - jar.saved;
    
    if (jar.targetDate) {
      const targetDate = new Date(jar.targetDate);
      const today = new Date();
      const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining > 0) {
        return {
          daily: remaining / daysRemaining,
          weekly: remaining / (daysRemaining / 7),
          monthly: remaining / (daysRemaining / 30)
        };
      }
    }
    
    // Default calculation if no target date
    return {
      daily: remaining / 30,
      weekly: remaining / 4,
      monthly: remaining
    };
  };

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-300`}>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉🎊✨💰🏆</div>
        </div>
      )}

      {/* Glassmorphism Header */}
      <div className={`sticky top-0 z-30 mb-6 ${darkMode ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-md border-b ${darkMode ? 'border-gray-700/20' : 'border-gray-200/20'} shadow-lg transform-gpu`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="Jarify Logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg" />
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${textColor} tracking-tight`}>
                Jarify
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <SettingsDialog />
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 sm:p-3 rounded-full ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                {darkMode ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-indigo-600" size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 pb-20">

        {!selectedJar ? (
          <>
            {jars.length > 0 && (
              <div className="space-y-6 mb-6">
                <EmotionalInsights
                  totalSaved={totalSaved}
                  totalTarget={totalTarget}
                  jarsCount={jars.length}
                  darkMode={darkMode}
                  currency={jars.length > 0 ? jars[jars.length - 1].currency : '$'}
                />

                <div className={`${cardBg} rounded-3xl p-4 sm:p-6 shadow-lg`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl sm:text-3xl">📊</span>
                    <h2 className={`text-xl sm:text-2xl font-bold ${textColor}`}>Savings Reports</h2>
                  </div>
                  <SavingsChart data={chartData} darkMode={darkMode} />
                </div>
              </div>
            )}

            <div className={`${cardBg} rounded-3xl p-4 sm:p-6 mb-6 shadow-lg`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl md:text-3xl">📝</span>
                  <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${textColor}`}>Notes</h2>
                </div>
                <div className="flex gap-2 sm:gap-3 -ml-[2.4%]">
                  <SavingsButton onClick={() => setShowCalculator(true)} variant="secondary" size="default" className="text-sm sm:text-base w-auto whitespace-nowrap">
                    📊 Calculator
                  </SavingsButton>
                  <SavingsButton onClick={() => setShowNoteModal(true)} size="default" className="text-sm sm:text-base w-auto whitespace-nowrap">
                    Add Note
                  </SavingsButton>
                </div>
              </div>
              <div className="flex lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
                {notes.map(note => (
                  <div
                    key={note.id}
                    data-note-item
                    onClick={() => setSelectedNoteId(note.id)}
                    className="relative min-w-[220px] w-[220px] lg:w-full lg:max-w-[220px] h-[180px] p-4 rounded shadow-md flex-shrink-0 cursor-pointer"
                    style={{
                      backgroundColor: noteColors[note.color].bg,
                      border: `2px solid ${noteColors[note.color].border}`
                    }}
                  >
                    {selectedNoteId === note.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id);
                          setSelectedNoteId(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full hover:bg-red-600 transition-all flex items-center justify-center text-lg font-bold"
                      >
                        ×
                      </button>
                    )}
                    <p className="text-gray-800 text-sm break-words whitespace-pre-wrap overflow-hidden">
                      {note.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${cardBg} rounded-3xl p-3 sm:p-4 md:p-6 shadow-lg`}>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <TrendingUp className="text-green-600" size={24} />
                  <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${textColor}`}>Savings</h2>
                </div>
                <SavingsButton onClick={() => setShowCategoryModal(true)} variant="secondary" size="default" className="text-sm sm:text-base md:text-lg whitespace-nowrap">
                  Create Category
                </SavingsButton>
              </div>

              {/* Categories with Subcategories */}
              <div className="space-y-6">
                {categories.filter(cat => getCategoryJars(cat.id).length > 0).map(category => {
                  const categoryJars = getCategoryJars(category.id);
                  const categoryTotal = getCategoryTotal(category.id);
                  const categoryTarget = getCategoryTarget(category.id);
                  const categoryProgress = categoryTarget > 0 ? ((categoryTotal / categoryTarget) * 100).toFixed(1) : '0.0';

                  return (
                    <div 
                      key={category.id} 
                      className={`${darkMode ? 'bg-gray-700/50' : 'bg-gradient-to-br from-blue-50/50 to-purple-50/50'} rounded-2xl p-4 sm:p-5 cursor-pointer`}
                      onClick={() => setSelectedCategoryId(selectedCategoryId === category.id ? null : category.id)}
                    >
                      {/* Category Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className={`text-lg sm:text-xl font-bold ${textColor}`}>{category.name}</h3>
                            <p className={`text-xs sm:text-sm ${textSecondary}`}>
                              {categoryJars.length} {categoryJars.length === 1 ? 'goal' : 'goals'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedCategoryId === category.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCategory(category);
                                setShowEditCategoryModal(true);
                              }}
                              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-white hover:bg-gray-100'} transition-colors`}
                              title="Edit Category"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${textColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                              </svg>
                            </button>
                          )}
                          <div className="text-right ml-2">
                            <p className={`text-base sm:text-lg font-bold text-green-600`}>
                              {categoryJars.length > 0 ? categoryJars[0].currency : '$'}{formatCurrency(categoryTotal)}
                            </p>
                            <p className={`text-xs ${textSecondary}`}>
                              of {categoryJars.length > 0 ? categoryJars[0].currency : '$'}{formatCurrency(categoryTarget)}
                            </p>
                            <p className={`text-xs font-bold ${
                              parseFloat(categoryProgress) >= 75 ? 'text-green-600' :
                              parseFloat(categoryProgress) >= 50 ? 'text-blue-600' :
                              parseFloat(categoryProgress) >= 25 ? 'text-orange-600' : 'text-red-600'
                            }`}>
                              {categoryProgress}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Subcategories (Jars) - Horizontal Scrollable */}
                      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent">
                        {categoryJars.map(jar => {
                          const progress = parseFloat(getProgress(jar));
                          return (
                            <div
                              key={jar.id}
                              onClick={() => setSelectedJar(jar)}
                              className={`${cardBg} rounded-2xl p-3 sm:p-4 shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300 relative group min-w-[200px] max-w-[200px] flex-shrink-0`}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setJarToDelete(jar);
                                  setShowDeleteConfirm(true);
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                              >
                                <Trash2 size={14} />
                              </button>
                              <h4 className={`text-sm sm:text-base font-bold ${textColor} mb-2`}>{jar.name}</h4>
                              <div className="relative h-24 sm:h-32 mb-2 flex items-center justify-center">
                                <JarVisualization progress={progress} jarId={jar.id} isLarge={false} />
                              </div>
                              <div className="text-center mb-2">
                                <div
                                  className={`text-base sm:text-lg font-bold ${
                                    progress >= 75 ? 'text-green-600' :
                                    progress >= 50 ? 'text-blue-600' :
                                    progress >= 25 ? 'text-orange-600' : 'text-red-600'
                                  }`}
                                >
                                  {progress}%
                                </div>
                              </div>
                              <div className={`flex justify-between items-center text-xs`}>
                                <span className="text-green-600 font-semibold">{jar.currency || '$'}{formatCurrency(jar.saved)}</span>
                                <span className="text-red-600 font-semibold">
                                  -{jar.currency || '$'}{formatCurrency(Math.abs(jar.saved - jar.target))}
                                </span>
                                <span className={textSecondary}>{jar.currency || '$'}{formatCurrency(jar.target)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Add New Jar Button */}
                <div className="flex items-center justify-center py-8">
                  <SavingsButton onClick={() => {
                    if (categories.length > 0) {
                      setNewJar({ name: '', target: '', currency: '€', categoryId: categories[0].id, targetDate: '' });
                    }
                    setShowCreateModal(true);
                  }} size="default" className="whitespace-nowrap text-sm sm:text-base w-auto">
                    <Plus size={16} className="inline mr-1 sm:hidden" />
                    <Plus size={18} className="hidden sm:inline mr-1" />
                    Create New Jar
                  </SavingsButton>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={`${cardBg} rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <button onClick={() => setSelectedJar(null)} className={`${textSecondary} hover:underline text-sm sm:text-base`}>
                ← Back
              </button>
              <SavingsButton
                variant="danger"
                size="sm"
                onClick={() => {
                  setJarToDelete(selectedJar);
                  setShowDeleteConfirm(true);
                }}
                className="text-sm"
              >
                Delete
              </SavingsButton>
            </div>
            <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-2 ${textColor}`}>{selectedJar.name}</h2>
            {selectedJar.createdAt && (
              <p className={`text-xs sm:text-sm ${textSecondary} mb-4 sm:mb-6 text-center`}>
                Created on {new Date(selectedJar.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
            <div className="relative h-56 sm:h-72 md:h-96 mb-4 sm:mb-6 flex items-center justify-center">
              <JarVisualization progress={parseFloat(getProgress(selectedJar))} jarId={selectedJar.id} isLarge={true} />
            </div>
            <div className="text-center mb-4 sm:mb-6">
              <div
                className={`text-3xl sm:text-4xl md:text-5xl font-bold ${(() => {
                  const p = parseFloat(getProgress(selectedJar));
                  return p >= 75 ? 'text-green-600' : p >= 50 ? 'text-blue-600' : p >= 25 ? 'text-orange-600' : 'text-red-600';
                })()}`}
              >
                {getProgress(selectedJar)}%
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded-xl sm:rounded-2xl p-3 sm:p-4`}>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <TrendingUp className="text-green-600" size={16} />
                  <span className={`text-xs sm:text-sm ${textSecondary}`}>Saved</span>
                </div>
                <p className={`text-base sm:text-xl md:text-2xl font-bold text-green-600 break-words`}>{selectedJar.currency || '$'}{formatCurrency(selectedJar.saved)}</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-purple-50'} rounded-xl sm:rounded-2xl p-3 sm:p-4`}>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Target className="text-purple-500" size={16} />
                  <span className={`text-xs sm:text-sm ${textSecondary}`}>Target</span>
                </div>
                <p className={`text-base sm:text-xl md:text-2xl font-bold ${textColor} break-words`}>{selectedJar.currency || '$'}{formatCurrency(selectedJar.target)}</p>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex gap-3 items-stretch">
                <input
                  type="number"
                  placeholder={`Amount (${selectedJar.currency || '$'})`}
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className={`w-[140px] px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 border-gray-300 focus:border-primary focus:outline-none ${
                    darkMode ? 'bg-gray-700 text-white' : ''
                  }`}
                />
                <SavingsButton onClick={addMoney} size="default" className="text-sm sm:text-base flex-1 whitespace-nowrap">
                  Add
                </SavingsButton>
              </div>
              <div className="flex gap-3 items-stretch">
                <input
                  type="number"
                  placeholder={`Amount (${selectedJar.currency || '$'})`}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className={`w-[140px] px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 border-gray-300 focus:border-primary focus:outline-none ${
                    darkMode ? 'bg-gray-700 text-white' : ''
                  }`}
                />
                <SavingsButton onClick={withdrawMoney} variant="danger" size="default" className="text-sm sm:text-base flex-1 whitespace-nowrap">
                  Withdraw
                </SavingsButton>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <SavingsButton onClick={() => setShowJarNoteModal(true)} size="default" className="text-sm sm:text-base whitespace-nowrap">
                Add Notes
              </SavingsButton>
              <SavingsButton onClick={() => setShowRecordsModal(true)} variant="secondary" size="default" className="text-sm sm:text-base whitespace-nowrap">
                📊 Records
              </SavingsButton>
            </div>

            {/* Investment Projections */}
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-purple-50'} rounded-2xl p-4 mb-6`}>
              <h3 className={`text-lg font-bold ${textColor} mb-2 flex items-center gap-2`}>
                📈 Investment Plan
                {selectedJar.targetDate && (
                  <span className={`text-xs ${textSecondary} font-normal`}>
                    (Target: {new Date(selectedJar.targetDate).toLocaleDateString()})
                  </span>
                )}
              </h3>
              {selectedJar.targetDate && (
                <p className={`text-xs ${textSecondary} mb-4`}>
                  Based on your target date
                </p>
              )}
              {tier === 'free' ? (
                <div className="space-y-3">
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 text-center`}>
                    <p className={`text-xs ${textSecondary} mb-1`}>Monthly</p>
                    <p className={`text-2xl font-bold ${textColor}`}>
                      {selectedJar.currency || '€'}{formatCurrency(getInvestmentPlan(selectedJar).monthly)}
                    </p>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'} rounded-xl p-4 border-2 border-dashed border-primary/30`}>
                    <p className="text-center text-sm text-primary font-medium">
                      💎 Unlock Daily & Weekly calculations with Premium
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-3 text-center`}>
                    <p className={`text-xs ${textSecondary} mb-1`}>Daily</p>
                    <p className={`text-xl font-bold ${textColor}`}>
                      {selectedJar.currency || '€'}{formatCurrency(getInvestmentPlan(selectedJar).daily)}
                    </p>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-3 text-center`}>
                    <p className={`text-xs ${textSecondary} mb-1`}>Weekly</p>
                    <p className={`text-xl font-bold ${textColor}`}>
                      {selectedJar.currency || '€'}{formatCurrency(getInvestmentPlan(selectedJar).weekly)}
                    </p>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-3 text-center`}>
                    <p className={`text-xs ${textSecondary} mb-1`}>Monthly</p>
                    <p className={`text-xl font-bold ${textColor}`}>
                      {selectedJar.currency || '€'}{formatCurrency(getInvestmentPlan(selectedJar).monthly)}
                    </p>
                  </div>
                </div>
              )}
              <p className={`text-xs ${textSecondary} text-center mt-3`}>
                {selectedJar.targetDate 
                  ? `Save these amounts to reach your ${selectedJar.currency || '€'}${formatCurrency(selectedJar.target)} goal by your target date`
                  : `Projected amounts to reach your ${selectedJar.currency || '€'}${formatCurrency(selectedJar.target)} goal`
                }
              </p>
            </div>

            {selectedJar.notes && selectedJar.notes.length > 0 && (
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-2xl p-4 mb-6`}>
                <h3 className={`text-lg font-bold ${textColor} mb-3`}>Sticky Notes</h3>
                <div className="flex lg:grid lg:grid-cols-2 gap-4 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
                  {selectedJar.notes.map(note => (
                    <div
                      key={note.id}
                      data-note-item
                      onClick={() => setSelectedJarNoteId(note.id)}
                      className="relative min-w-[220px] w-[220px] lg:w-full h-[180px] p-4 rounded shadow-md flex-shrink-0 cursor-pointer"
                      style={{
                        backgroundColor: noteColors[note.color].bg,
                        border: `2px solid ${noteColors[note.color].border}`
                      }}
                    >
                      {selectedJarNoteId === note.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteJarNote(note.id);
                            setSelectedJarNoteId(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full hover:bg-red-600 transition-all flex items-center justify-center text-lg font-bold"
                        >
                          ×
                        </button>
                      )}
                      <p className="text-gray-800 text-sm break-words whitespace-pre-wrap overflow-hidden">
                        {note.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Jar Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-4 z-40">
          <div className={`${cardBg} rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl`}>
            <h3 className={`text-xl sm:text-2xl font-bold mb-6 ${textColor}`}>Create New Jar</h3>
            {categories.length === 0 ? (
              <>
                <p className={`mb-6 ${textSecondary}`}>
                  You need to create a category first before creating a jar!
                </p>
                <div className="flex gap-3">
                  <SavingsButton variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1 whitespace-nowrap">
                    Cancel
                  </SavingsButton>
                  <SavingsButton onClick={() => {
                    setShowCreateModal(false);
                    setShowCategoryModal(true);
                  }} className="flex-1 whitespace-nowrap">
                    Create Category
                  </SavingsButton>
                </div>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Jar Name"
                  value={newJar.name}
                  onChange={(e) => setNewJar({ ...newJar, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-primary focus:outline-none mb-4 ${
                    darkMode ? 'bg-gray-700 text-white' : ''
                  }`}
                />
                <input
                  type="number"
                  placeholder={`Target (${newJar.currency})`}
                  value={newJar.target}
                  onChange={(e) => setNewJar({ ...newJar, target: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-primary focus:outline-none mb-4 ${
                    darkMode ? 'bg-gray-700 text-white' : ''
                  }`}
                />
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${textColor}`}>Category</label>
                  <select
                    value={newJar.categoryId}
                    onChange={(e) => setNewJar({ ...newJar, categoryId: parseInt(e.target.value) })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-primary focus:outline-none ${
                      darkMode ? 'bg-gray-700 text-white' : ''
                    }`}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${textColor}`}>Currency Symbol</label>
                  {tier === 'free' ? (
                    <>
                      <select
                        value="€"
                        disabled
                        className={`w-full px-4 py-3 rounded-xl border-2 border-primary focus:outline-none ${
                          darkMode ? 'bg-gray-700 text-white opacity-60' : 'bg-gray-100 opacity-60'
                        }`}
                      >
                        <option value="€">€ (EUR - Euro)</option>
                      </select>
                      <p className={`text-xs ${textSecondary} mt-1`}>
                        💎 Premium members can choose from 12+ currencies
                      </p>
                    </>
                  ) : (
                    <select
                      value={newJar.currency}
                      onChange={(e) => setNewJar({ ...newJar, currency: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border-2 border-primary focus:outline-none ${
                        darkMode ? 'bg-gray-700 text-white' : ''
                      }`}
                    >
                      <option value="$">$ (USD - Dollar)</option>
                      <option value="€">€ (EUR - Euro)</option>
                      <option value="£">£ (GBP - Pound)</option>
                      <option value="¥">¥ (JPY/CNY - Yen/Yuan)</option>
                      <option value="₹">₹ (INR - Rupee)</option>
                      <option value="₽">₽ (RUB - Ruble)</option>
                      <option value="₩">₩ (KRW - Won)</option>
                      <option value="PKR">PKR (Pakistani Rupee)</option>
                      <option value="AED">AED (UAE Dirham)</option>
                      <option value="SAR">SAR (Saudi Riyal)</option>
                      <option value="CHF">CHF (Swiss Franc)</option>
                      <option value="CAD">CAD (Canadian Dollar)</option>
                      <option value="AUD">AUD (Australian Dollar)</option>
                    </select>
                  )}
                </div>
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${textColor}`}>Target Date (Optional)</label>
                  <input
                    type="date"
                    value={newJar.targetDate}
                    onChange={(e) => setNewJar({ ...newJar, targetDate: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-primary focus:outline-none ${
                      darkMode ? 'bg-gray-700 text-white' : ''
                    }`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className={`text-xs ${textSecondary} mt-1`}>
                    Set a deadline to calculate daily/weekly/monthly savings needed
                  </p>
                </div>
                <div className="flex gap-3">
                  <SavingsButton variant="secondary" onClick={() => setShowCreateModal(false)} className="flex-1 whitespace-nowrap">
                    Cancel
                  </SavingsButton>
                  <SavingsButton onClick={createJar} className="flex-1 whitespace-nowrap">
                    Create
                  </SavingsButton>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-4 z-40">
          <div className={`${cardBg} rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl`}>
            <h3 className={`text-xl sm:text-2xl font-bold mb-6 ${textColor}`}>Add Note</h3>
            <textarea
              placeholder="Write your note..."
              value={newNote.text}
              onChange={(e) => setNewNote({ ...newNote, text: e.target.value })}
              rows={6}
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none mb-4 resize-none ${
                darkMode ? 'bg-gray-700 text-white' : ''
              }`}
              style={{ borderColor: '#3c78f0', backgroundColor: noteColors[newNote.color].bg }}
            />
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-3 ${textColor}`}>Choose Color</label>
              <div className="grid grid-cols-6 gap-2">
                {Object.keys(noteColors).map(color => (
                  <button
                    key={color}
                    onClick={() => setNewNote({ ...newNote, color })}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 ${
                      newNote.color === color ? 'ring-4 ring-blue-400' : ''
                    }`}
                    style={{ backgroundColor: noteColors[color].bg, borderColor: noteColors[color].border }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <SavingsButton
                variant="secondary"
                onClick={() => {
                  setShowNoteModal(false);
                  setNewNote({ text: '', color: 'yellow' });
                }}
                className="flex-1"
              >
                Cancel
              </SavingsButton>
              <SavingsButton onClick={addNote} className="flex-1">
                Add
              </SavingsButton>
            </div>
          </div>
        </div>
      )}

      {/* Jar Note Modal */}
      {showJarNoteModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-4 z-40">
          <div className={`${cardBg} rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl`}>
            <h3 className={`text-xl sm:text-2xl font-bold mb-6 ${textColor}`}>Add Sticky Note</h3>
            <textarea
              placeholder="Write your note..."
              value={newJarNote.text}
              onChange={(e) => setNewJarNote({ ...newJarNote, text: e.target.value })}
              rows={6}
              className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none mb-4 resize-none ${
                darkMode ? 'bg-gray-700 text-white' : ''
              }`}
              style={{ borderColor: '#3c78f0', backgroundColor: noteColors[newJarNote.color].bg }}
            />
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-3 ${textColor}`}>Choose Color</label>
              <div className="grid grid-cols-6 gap-2">
                {Object.keys(noteColors).map(color => (
                  <button
                    key={color}
                    onClick={() => setNewJarNote({ ...newJarNote, color })}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 ${
                      newJarNote.color === color ? 'ring-4 ring-blue-400' : ''
                    }`}
                    style={{ backgroundColor: noteColors[color].bg, borderColor: noteColors[color].border }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <SavingsButton
                variant="secondary"
                onClick={() => {
                  setShowJarNoteModal(false);
                  setNewJarNote({ text: '', color: 'yellow' });
                }}
                className="flex-1"
              >
                Cancel
              </SavingsButton>
              <SavingsButton onClick={addJarNote} className="flex-1">
                Add
              </SavingsButton>
            </div>
          </div>
        </div>
      )}

      {/* Records Modal */}
      {showRecordsModal && selectedJar && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-4 z-40">
          <div className={`${cardBg} rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-y-auto`}>
            <h3 className={`text-xl sm:text-2xl font-bold mb-6 ${textColor}`}>Transaction Records - {selectedJar.name}</h3>
            {tier === 'free' && (
              <p className={`text-xs ${textSecondary} mb-4 text-center`}>
                📅 Free plan shows last 30 days. Upgrade to Premium for unlimited history!
              </p>
            )}
            {selectedJar.records && selectedJar.records.length > 0 ? (
              <div className="space-y-3">
                {selectedJar.records
                  .filter(record => {
                    if (tier === 'premium') return true;
                    const daysDiff = (new Date().getTime() - new Date(record.date).getTime()) / (1000 * 60 * 60 * 24);
                    return daysDiff <= FREE_LIMITS.transactionHistoryDays;
                  })
                  .map(record => {
                  const recordDate = new Date(record.date);
                  return (
                    <div
                      key={record.id}
                      className={`p-4 rounded-xl ${
                        record.type === 'saved'
                          ? darkMode ? 'bg-green-900/20' : 'bg-green-50'
                          : darkMode ? 'bg-red-900/20' : 'bg-red-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`font-bold ${record.type === 'saved' ? 'text-green-600' : 'text-red-600'}`}>
                            {record.type === 'saved' ? '+ ' : '- '}{selectedJar.currency || '€'}{formatCurrency(record.amount)}
                          </p>
                          <p className={`text-sm ${textSecondary}`}>
                            {recordDate.toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          record.type === 'saved'
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}>
                          {record.type === 'saved' ? 'Saved' : 'Withdrawn'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={`text-center ${textSecondary} py-8`}>No records yet. Start saving or withdrawing to see your history!</p>
            )}
            <div className="mt-6">
              <SavingsButton onClick={() => setShowRecordsModal(false)} className="w-full">
                Close
              </SavingsButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && jarToDelete && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className={`${cardBg} rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl`}>
            <h3 className={`text-xl sm:text-2xl font-bold mb-4 ${textColor}`}>Delete Jar?</h3>
            <p className={`mb-6 ${textSecondary}`}>
              Delete "{jarToDelete.name}"? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <SavingsButton
                variant="secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setJarToDelete(null);
                }}
                className="flex-1"
              >
                Cancel
              </SavingsButton>
              <SavingsButton variant="danger" onClick={() => deleteJar(jarToDelete.id)} className="flex-1">
                Delete
              </SavingsButton>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-4 z-40">
          <div className={`${cardBg} rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl`}>
            <h3 className={`text-xl sm:text-2xl font-bold mb-6 ${textColor}`}>Create New Category</h3>
            <input
              type="text"
              placeholder="Category Name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border-2 border-primary focus:outline-none mb-4 ${
                darkMode ? 'bg-gray-700 text-white' : ''
              }`}
            />
            <div className="flex gap-3">
              <SavingsButton variant="secondary" onClick={() => setShowCategoryModal(false)} className="flex-1 whitespace-nowrap">
                Cancel
              </SavingsButton>
              <SavingsButton onClick={createCategory} className="flex-1 whitespace-nowrap">
                Create
              </SavingsButton>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && editingCategory && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-4 z-40">
          <div className={`${cardBg} rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl`}>
            <h3 className={`text-xl sm:text-2xl font-bold mb-6 ${textColor}`}>Edit Category</h3>
            <input
              type="text"
              placeholder="Category Name"
              value={editingCategory.name}
              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border-2 border-primary focus:outline-none mb-4 ${
                darkMode ? 'bg-gray-700 text-white' : ''
              }`}
            />
            <div className="flex gap-3">
              <SavingsButton 
                variant="secondary" 
                onClick={() => {
                  setShowEditCategoryModal(false);
                  setEditingCategory(null);
                }} 
                className="flex-1 whitespace-nowrap"
              >
                Cancel
              </SavingsButton>
              <SavingsButton onClick={updateCategory} className="flex-1 whitespace-nowrap">
                Save
              </SavingsButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {showDeleteCategoryConfirm && categoryToDelete && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
          <div className={`${cardBg} rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl`}>
            <h3 className={`text-xl sm:text-2xl font-bold mb-4 ${textColor}`}>Delete Category?</h3>
            <p className={`mb-6 ${textSecondary}`}>
              Delete category "{categoryToDelete.name}"? This will also delete all jars in this category. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <SavingsButton
                variant="secondary"
                onClick={() => {
                  setShowDeleteCategoryConfirm(false);
                  setCategoryToDelete(null);
                }}
                className="flex-1"
              >
                Cancel
              </SavingsButton>
              <SavingsButton variant="danger" onClick={() => deleteCategory(categoryToDelete.id)} className="flex-1">
                Delete
              </SavingsButton>
            </div>
          </div>
        </div>
      )}

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center p-4 z-40">
          <div className={`${cardBg} rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl`}>
            <h3 className={`text-xl sm:text-2xl font-bold mb-6 ${textColor} flex items-center gap-2`}>
              📊 Savings Calculator
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${textColor}`}>Target Amount ($)</label>
                <input
                  type="number"
                  placeholder="Enter target amount"
                  value={calcTargetAmount}
                  onChange={(e) => setCalcTargetAmount(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-primary focus:outline-none ${
                    darkMode ? 'bg-gray-700 text-white' : ''
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-semibold mb-2 ${textColor}`}>Target Date</label>
                <input
                  type="date"
                  value={calcTargetDate}
                  onChange={(e) => setCalcTargetDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-primary focus:outline-none ${
                    darkMode ? 'bg-gray-700 text-white' : ''
                  }`}
                />
              </div>
              <SavingsButton onClick={calculateDailySavings} className="w-full">
                Calculate
              </SavingsButton>
            </div>
            
            {dailySavings !== null && (
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-50 to-purple-50'} rounded-2xl p-6 mb-6`}>
                <h4 className={`text-lg font-bold ${textColor} mb-4 text-center`}>Daily Savings Plan</h4>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 text-center mb-3`}>
                  <p className={`text-sm ${textSecondary} mb-1`}>Save Daily</p>
                  <p className={`text-3xl font-bold ${textColor}`}>${formatCurrency(dailySavings)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-3 text-center`}>
                    <p className={`text-xs ${textSecondary} mb-1`}>Weekly</p>
                    <p className={`text-lg font-bold ${textColor}`}>${formatCurrency(dailySavings * 7)}</p>
                  </div>
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-3 text-center`}>
                    <p className={`text-xs ${textSecondary} mb-1`}>Monthly</p>
                    <p className={`text-lg font-bold ${textColor}`}>${formatCurrency(dailySavings * 30)}</p>
                  </div>
                </div>
                <p className={`text-xs ${textSecondary} text-center mt-3`}>
                  To reach ${formatCurrency(parseFloat(calcTargetAmount))} by {new Date(calcTargetDate).toLocaleDateString()}
                </p>
              </div>
            )}

            <SavingsButton 
              variant="secondary" 
              onClick={() => {
                setShowCalculator(false);
                setCalcTargetAmount('');
                setCalcTargetDate('');
                setDailySavings(null);
              }} 
              className="w-full"
            >
              Close
            </SavingsButton>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
