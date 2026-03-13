import { create } from 'zustand';
import { SimilarDefect, ImpactResult, TestCase } from '../types';

interface AnalysisState {
  // Query state
  currentQuery: string;
  currentModule: string | null;

  // Results
  similarDefects: SimilarDefect[];
  impactResult: ImpactResult | null;
  testCases: TestCase[];

  // Loading states
  isLoadingSimilar: boolean;
  isLoadingImpact: boolean;
  isLoadingTestCases: boolean;

  // Error states
  errorSimilar: string | null;
  errorImpact: string | null;
  errorTestCases: string | null;

  // Actions
  setQuery: (query: string) => void;
  setModule: (module: string | null) => void;
  setSimilarDefects: (defects: SimilarDefect[]) => void;
  setImpactResult: (result: ImpactResult | null) => void;
  setTestCases: (cases: TestCase[]) => void;
  setLoadingSimilar: (loading: boolean) => void;
  setLoadingImpact: (loading: boolean) => void;
  setLoadingTestCases: (loading: boolean) => void;
  setErrorSimilar: (error: string | null) => void;
  setErrorImpact: (error: string | null) => void;
  setErrorTestCases: (error: string | null) => void;
  resetResults: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  // Initial state
  currentQuery: '',
  currentModule: null,
  similarDefects: [],
  impactResult: null,
  testCases: [],
  isLoadingSimilar: false,
  isLoadingImpact: false,
  isLoadingTestCases: false,
  errorSimilar: null,
  errorImpact: null,
  errorTestCases: null,

  // Actions
  setQuery: (query) => set({ currentQuery: query }),
  setModule: (module) => set({ currentModule: module }),
  setSimilarDefects: (defects) => set({ similarDefects: defects }),
  setImpactResult: (result) => set({ impactResult: result }),
  setTestCases: (cases) => set({ testCases: cases }),
  setLoadingSimilar: (loading) => set({ isLoadingSimilar: loading }),
  setLoadingImpact: (loading) => set({ isLoadingImpact: loading }),
  setLoadingTestCases: (loading) => set({ isLoadingTestCases: loading }),
  setErrorSimilar: (error) => set({ errorSimilar: error }),
  setErrorImpact: (error) => set({ errorImpact: error }),
  setErrorTestCases: (error) => set({ errorTestCases: error }),

  resetResults: () =>
    set({
      similarDefects: [],
      impactResult: null,
      testCases: [],
      errorSimilar: null,
      errorImpact: null,
      errorTestCases: null,
    }),
}));
