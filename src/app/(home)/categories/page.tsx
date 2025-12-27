import { categoriesAPI } from '@/lib/api';

import CategoriesList from './CategoriesList';

export default async function CategoriesPage() {
  const initialData = await categoriesAPI.getAllCategoryData();

  return <CategoriesList initialData={initialData} />;
}