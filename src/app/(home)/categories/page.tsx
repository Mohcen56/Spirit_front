import CategoriesList from './CategoriesList';

// Fetch categories client-side so auth token from localStorage is included.
export default function CategoriesPage() {
  return <CategoriesList initialData={null} />;
}