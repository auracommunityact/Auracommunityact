sed -i '1i\
import { useEffect, useState as useReactState } from "react";\
import { supabase, Project } from "../lib/supabase";\
' src/components/Sections.tsx
