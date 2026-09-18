import { useState } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group';

export function SearchBar({ value, onSearch }) {
  const [localValue, setLocalValue] = useState(value);

  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <SearchIcon className="opacity-80" />
      </InputGroupAddon>
      <Input
        type="search"
        placeholder="Search feature requests…"
        aria-label="Search feature requests"
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value);
          onSearch(e.target.value);
        }}
      />
      {localValue && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="me-1.5"
          aria-label="Clear search"
          onClick={() => {
            setLocalValue('');
            onSearch('');
          }}
        >
          <XIcon />
        </Button>
      )}
    </InputGroup>
  );
}