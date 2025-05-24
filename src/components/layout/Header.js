import { atomic_age } from "@/config/fonts";
import {
  Button,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";

export default function Header() {
  return (
    <Navbar maxWidth="full" className="bg-default-50">
      <NavbarBrand>
        <p className={`${atomic_age.className} text-xl lg:text-4xl`}>
          SiteLike
        </p>
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem>
          <Button as={Link} color="primary" href="https://www.sitelike.me">
            Get Started
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
