"use client";
import { Pagination } from "@mui/material";
import { useGridApiContext, useGridSelector, gridPageCountSelector, gridPaginationModelSelector } from "@mui/x-data-grid";

export default function CustomPagination() {
    const apiRef = useGridApiContext();
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);
    const paginationModel = useGridSelector(apiRef, gridPaginationModelSelector);

    return (
        <Pagination
            color="primary"
            count={pageCount}
            page={paginationModel.page + 1}
            onChange={(event, value) => {
                apiRef.current.setPage(value - 1);
            }}
            shape="rounded"
            siblingCount={5}
            boundaryCount={1}
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