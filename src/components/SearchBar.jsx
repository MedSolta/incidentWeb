import { Form, InputGroup, Button } from 'react-bootstrap';
import { Search } from 'lucide-react';

const SearchBar = ({
  searchTerm,
  setSearchTerm,
  onSearch,
  onReset,
  placeholder = "Rechercher..."
}) => {
  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-body">
        <Form onSubmit={onSearch}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline-secondary" type="submit">
              <Search size={18} />
            </Button>
            {searchTerm && (
              <Button
                variant="outline-danger"
                onClick={onReset}
              >
                Réinitialiser
              </Button>
            )}
          </InputGroup>
        </Form>
      </div>
    </div>
  );
};

export default SearchBar;