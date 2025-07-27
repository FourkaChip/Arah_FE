"use client";
import { Pagination } from "@mui/material";
import { PaginationProps } from "@/types/pagination";

export default function CustomPagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
    return (
        <Pagination
            color="primary"
            count={totalPages}
            page={currentPage}
            onChange={(_, value) => onPageChange(value)}
            shape="rounded"
            siblingCount={5}
            boundaryCount={1}
            className={className}
            sx={{
                "& .MuiPaginationItem-root": {
                    color: "#333",
                    fontSize: "16px",
                },
                "& .Mui-selected": {
                    backgroundColor: "#1E266D",
                    color: "white",
                    fontWeight: "bold",
                },
            }}
        />
    );
}