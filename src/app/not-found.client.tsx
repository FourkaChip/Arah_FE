"use client";

export default function NotFoundClient() {
    return (
        <button
            className="button is-primary not-found-btn"
            onClick={() => window.history.back()}
        >
            돌아가기
        </button>
    );
}
