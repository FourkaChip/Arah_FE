
export interface CustomSearchProps {
    onSearch: (params: { search: string; start: string; end: string }) => void;
    startDate?: string;
    endDate?: string;
}