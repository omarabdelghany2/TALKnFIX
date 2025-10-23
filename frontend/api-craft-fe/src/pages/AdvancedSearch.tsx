import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { postsAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import PostCard from '@/components/PostCard';
import Navbar from '@/components/Navbar';

const AdvancedSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Search filters state
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [tags, setTags] = useState(searchParams.get('tags') || '');
  const [author, setAuthor] = useState(searchParams.get('author') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [minReactions, setMinReactions] = useState(searchParams.get('minReactions') || '');

  // Results state
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load results on mount if there are search params
  useEffect(() => {
    if (searchParams.toString()) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);

    try {
      const params: any = {
        sortBy,
      };

      if (keyword.trim()) params.q = keyword.trim();
      if (tags.trim()) params.tags = tags.trim();
      if (author.trim()) params.author = author.trim();
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (minReactions) params.minReactions = parseInt(minReactions);

      const response = await postsAPI.search(params);
      setPosts(response.posts || []);

      // Update URL params
      const newParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) newParams.set(key, String(value));
      });
      setSearchParams(newParams);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to search posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setKeyword('');
    setTags('');
    setAuthor('');
    setSortBy('newest');
    setDateFrom('');
    setDateTo('');
    setMinReactions('');
    setPosts([]);
    setHasSearched(false);
    setSearchParams(new URLSearchParams());
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const handleNavSearch = (query: string) => {
    setKeyword(query);
  };

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar onSearch={handleNavSearch} />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Search className="h-8 w-8" />
            Advanced Search
          </h1>
          <p className="text-muted-foreground">
            Find posts with powerful filters
          </p>
        </div>

        {/* Search Filters */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            {/* Keyword Search */}
            <div>
              <Label htmlFor="keyword">Keywords</Label>
              <Input
                id="keyword"
                placeholder="Search in titles and content..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Tags */}
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="react, nodejs, typescript"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              {/* Author */}
              <div>
                <Label htmlFor="author">Author Username</Label>
                <Input
                  id="author"
                  placeholder="username"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Date From */}
              <div>
                <Label htmlFor="dateFrom">Date From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div>
                <Label htmlFor="dateTo">Date To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              {/* Min Reactions */}
              <div>
                <Label htmlFor="minReactions">Min Reactions</Label>
                <Input
                  id="minReactions"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={minReactions}
                  onChange={(e) => setMinReactions(e.target.value)}
                />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <Label htmlFor="sortBy">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sortBy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="mostReactions">Most Reactions</SelectItem>
                  <SelectItem value="mostComments">Most Comments</SelectItem>
                  {keyword && <SelectItem value="relevance">Most Relevant</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSearch} className="flex-1" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </Card>

        {/* Search Results */}
        {hasSearched && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Search Results
                {!loading && <span className="text-muted-foreground ml-2">({posts.length})</span>}
              </h2>
            </div>

            {loading ? (
              <Card className="p-8 text-center text-muted-foreground">
                Searching...
              </Card>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onPostClick={handlePostClick}
                    onPostDeleted={() => handleSearch()}
                    onPostHidden={() => handleSearch()}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No posts found</p>
                <p className="text-sm">Try adjusting your search filters</p>
              </Card>
            )}
          </div>
        )}

        {!hasSearched && (
          <Card className="p-12 text-center text-muted-foreground">
            <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Enter your search criteria above and click Search</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;
