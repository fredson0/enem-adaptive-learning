import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseDatabaseService implements OnModuleInit {
  private _client: SupabaseClient;
  private readonly logger = new Logger(SupabaseDatabaseService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      this.logger.error('Faltam variaveis de ambiente do Supabase!');
      throw new Error(
        'Supabase URL e Service Role Key são obrigatórios.',
      );
    }

    this._client = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    });

    this.logger.log('Conexão com o Supabase estabelecida com sucesso!');
  }

  public get client(): SupabaseClient {
    return this._client;
  }
}
