import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Search, User, BookOpen, Calendar, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const { userRole } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchData = async () => {
      const searches = [];

      if (userRole === 'admin' || userRole === 'teacher') {
        searches.push(
          supabase
            .from('profiles')
            .select('*')
            .ilike('full_name', `%${query}%`)
            .limit(5)
        );
      }

      searches.push(
        supabase
          .from('announcements')
          .select('*')
          .ilike('title', `%${query}%`)
          .eq('published', true)
          .limit(5)
      );

      const allResults = await Promise.all(searches);
      const combined = allResults.flatMap((r) => r.data || []);
      setResults(combined);
    };

    const debounce = setTimeout(searchData, 300);
    return () => clearTimeout(debounce);
  }, [query, userRole]);

  return (
    <>
      <Button
        variant="outline"
        className="gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search students, announcements..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((item) => (
                <CommandItem key={item.id}>
                  {item.full_name ? (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      {item.full_name}
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      {item.title}
                    </>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}