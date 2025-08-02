import { supabase } from "@/integrations/supabase/client";

export const seedInitialData = async () => {
  try {
    // Insertar categorías si no existen
    const { data: existingCategories } = await supabase
      .from("categories")
      .select("id")
      .limit(1);

    if (!existingCategories || existingCategories.length === 0) {
      const { error: categoriesError } = await supabase
        .from("categories")
        .insert([
          {
            name: "Próximas Carreras",
            description: "Anuncios de carreras y eventos deportivos",
            color: "#EF4444"
          },
          {
            name: "General",
            description: "Discusiones generales",
            color: "#3B82F6"
          },
          {
            name: "Entrenamiento",
            description: "Tips y consejos de entrenamiento",
            color: "#10B981"
          },
          {
            name: "Equipamiento",
            description: "Reseñas y recomendaciones de equipo",
            color: "#F59E0B"
          }
        ]);

      if (categoriesError) {
        console.error("Error creando categorías:", categoriesError);
      } else {
        console.log("Categorías creadas exitosamente");
      }
    }

    // Obtener IDs de categorías para los posts de ejemplo
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name");

    if (categories && categories.length > 0) {
      const trainingCategory = categories.find(cat => cat.name === "Entrenamiento");
      const equipmentCategory = categories.find(cat => cat.name === "Equipamiento");

      // Insertar algunos posts de ejemplo
      const { data: existingPosts } = await supabase
        .from("posts")
        .select("id")
        .limit(1);

      if (!existingPosts || existingPosts.length === 0) {
        const { error: postsError } = await supabase
          .from("posts")
          .insert([
            {
              title: "¿Cuál es vuestra rutina de entrenamiento favorita?",
              content: "Estoy buscando nuevas ideas para variar mi entrenamiento semanal. ¿Qué rutinas funcionan mejor para vosotros? Me interesa especialmente combinar trabajo de resistencia con fuerza.",
              category_id: trainingCategory?.id,
              author_name: "RunnerPro"
            },
            {
              title: "Reseña: Zapatillas Nike Air Zoom Pegasus 40",
              content: "Después de 500km con estas zapatillas, aquí está mi reseña completa. Excelente amortiguación, durabilidad sorprendente y muy cómodas para entrenamientos largos.",
              category_id: equipmentCategory?.id,
              author_name: "MaratonMania"
            }
          ]);

        if (postsError) {
          console.error("Error creando posts:", postsError);
        } else {
          console.log("Posts de ejemplo creados exitosamente");
        }
      }
    }

    // Insertar algunos eventos de carreras de ejemplo
    const { data: existingEvents } = await supabase
      .from("race_events")
      .select("id")
      .limit(1);

    if (!existingEvents || existingEvents.length === 0) {
      const { error: eventsError } = await supabase
        .from("race_events")
        .insert([
          {
            title: "Maratón Valencia 2024",
            description: "El maratón más rápido de España. Una oportunidad única para conseguir tu mejor marca personal en un circuito completamente plano.",
            event_date: "2024-12-01",
            location: "Valencia, España"
          },
          {
            title: "Media Maratón Madrid",
            description: "Carrera por el centro histórico de Madrid. Disfruta corriendo por los lugares más emblemáticos de la capital.",
            event_date: "2024-11-15",
            location: "Madrid, España"
          },
          {
            title: "10K Barcelona",
            description: "Carrera popular de 10K por el Paseo Marítimo de Barcelona. Perfecta para principiantes y experimentados.",
            event_date: "2024-10-20",
            location: "Barcelona, España"
          }
        ]);

      if (eventsError) {
        console.error("Error creando eventos:", eventsError);
      } else {
        console.log("Eventos de ejemplo creados exitosamente");
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error en seedInitialData:", error);
    return { success: false, error };
  }
};