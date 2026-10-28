package com.academy42x.lms.config;

import com.azure.core.credential.AccessToken;
import com.azure.core.credential.TokenCredential;
import com.azure.core.credential.TokenRequestContext;
import com.azure.identity.DefaultAzureCredentialBuilder;
import com.azure.identity.InteractiveBrowserCredentialBuilder;
import com.azure.identity.ManagedIdentityCredentialBuilder;
import com.microsoft.sqlserver.jdbc.SQLServerAccessTokenCallback;
import com.microsoft.sqlserver.jdbc.SqlAuthenticationToken;
import java.time.OffsetDateTime;
import java.util.Locale;

/**
 * Microsoft Entra tokens for Azure SQL (set as accessTokenCallbackClass in the JDBC URL).
 * One shared token for every pooled connection: the browser sign-in happens once per backend start
 * and the token is renewed silently. AZURE_SQL_AUTH = interactive (default), managed-identity or default.
 */
public class AzureSqlTokenCallback implements SQLServerAccessTokenCallback {

    private static final TokenRequestContext SCOPE =
            new TokenRequestContext().addScopes("https://database.windows.net/.default");
    private static final TokenCredential CREDENTIAL = createCredential();
    private static AccessToken cached;

    private static TokenCredential createCredential() {
        String mode = System.getenv().getOrDefault("AZURE_SQL_AUTH", "interactive").toLowerCase(Locale.ROOT);
        return switch (mode) {
            case "managed-identity" -> new ManagedIdentityCredentialBuilder().build();
            case "default" -> new DefaultAzureCredentialBuilder().build();
            default -> new InteractiveBrowserCredentialBuilder().build();
        };
    }

    @Override
    public SqlAuthenticationToken getAccessToken(String spn, String stsurl) {
        AccessToken token = currentToken();
        return new SqlAuthenticationToken(token.getToken(), token.getExpiresAt().toInstant().toEpochMilli());
    }

    // Synchronized so connections opened at the same time share one sign-in instead of opening several tabs.
    private static synchronized AccessToken currentToken() {
        if (cached == null || cached.getExpiresAt().isBefore(OffsetDateTime.now().plusMinutes(5))) {
            cached = CREDENTIAL.getTokenSync(SCOPE);
        }
        return cached;
    }
}
