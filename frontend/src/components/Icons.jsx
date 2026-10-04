export function Icon({ name, className = "h-5 w-5" }) {
  const paths = {
    search: <path d="m21 21-4.3-4.3m1.3-5.2a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />,
    heart: <path d="M20.8 5.6a5.2 5.2 0 0 0-7.4 0L12 7l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 21.6l8.8-8.6a5.2 5.2 0 0 0 0-7.4Z" />,
    cart: <path d="M7 8h14l-1.8 9H8.1L6 4H3m6 17h.1M18 21h.1" />,
    user: <path d="M20 21a8 8 0 0 0-16 0m12-13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />,
    close: <path d="M18 6 6 18M6 6l12 12" />,
    minus: <path d="M5 12h14" />,
    plus: <path d="M12 5v14M5 12h14" />,
    trash: <path d="M4 7h16m-9 4v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" />,
    chevron: <path d="m9 18 6-6-6-6" />,
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
