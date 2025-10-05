import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookManagement } from './library/BookManagement';
import { BorrowingManagement } from './library/BorrowingManagement';
import { LibraryReports } from './library/LibraryReports';

export default function LibraryManagement() {
  return (
    <Tabs defaultValue="books" className="space-y-6">
      <TabsList>
        <TabsTrigger value="books">Books</TabsTrigger>
        <TabsTrigger value="borrowing">Borrowing</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="books">
        <BookManagement />
      </TabsContent>

      <TabsContent value="borrowing">
        <BorrowingManagement />
      </TabsContent>

      <TabsContent value="reports">
        <LibraryReports />
      </TabsContent>
    </Tabs>
  );
}