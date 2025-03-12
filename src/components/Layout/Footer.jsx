import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Link,
  Typography,
  useTheme,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const Footer = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 1.5,
        mt: 'auto',
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(245, 245, 245, 0.95)',
      }}
    >
      <Container maxWidth="lg">
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems="center" 
          spacing={1}
        >
          {/* Copyright */}
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            © {currentYear} {t('footer.title')}
          </Typography>
          
          {/* Developer info with social links */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
              {t('footer.developedBy')} Giovanni Mirarchi
            </Typography>
            
            <Tooltip title="GitHub" arrow>
              <IconButton 
                component={Link}
                href="https://github.com/giovannimirarchi420" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="GitHub"
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                <GitHubIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="LinkedIn" arrow>
              <IconButton 
                component={Link}
                href="https://www.linkedin.com/in/giovanni-mirarchi/" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
          
          {/* Privacy / Info links */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography 
              component={Link} 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontSize: '0.85rem', 
                textDecoration: 'none',
                '&:hover': { color: theme.palette.primary.main }
              }}
              href="#"
            >
              {t('footer.privacyPolicy')}
            </Typography>
            <Typography 
              component={Link} 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontSize: '0.85rem', 
                textDecoration: 'none',
                '&:hover': { color: theme.palette.primary.main }
              }}
              href="#"
            >
              {t('footer.termsOfService')}
            </Typography>
            <Tooltip title={t('footer.systemInfo')} arrow>
              <IconButton 
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;