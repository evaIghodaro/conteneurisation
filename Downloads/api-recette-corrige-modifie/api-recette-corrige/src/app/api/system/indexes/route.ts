import { connectDB } from "@/lib/mongodb";
import { createIndexes } from "@/lib/indexes";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    
    console.log('🚀 Initialisation des index MongoDB...');
    await createIndexes();
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Index MongoDB créés avec succès',
        details: {
          recipe_indexes: 'search, pagination, filters, sorting',
          user_indexes: 'email, favorites, timestamps'
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Erreur lors de la création des index:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la création des index',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
