export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50 py-8">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Olin. All rights reserved.</p>
      </div>
    </footer>
  );
}
